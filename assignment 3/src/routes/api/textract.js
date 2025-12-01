const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * POST /v1/fragments/:id/extract-text
 * Extract text from an image fragment using Amazon Textract
 * Body: { saveAsFragment: boolean }
 */
const extractText = async (req, res) => {
  const { id } = req.params;
  const { saveAsFragment = false } = req.body || {};

  try {
    const fragment = await Fragment.byId(req.user, id);

    // Verify it's an image
    if (!fragment.isImage()) {
      return res.status(400).json(createErrorResponse(400, 'Text extraction only works on image fragments'));
    }

    const data = await fragment.getData();

    // Call Amazon Textract
    const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');
    const client = new TextractClient({ region: process.env.AWS_REGION || 'us-east-1' });

    const command = new DetectDocumentTextCommand({
      Document: { Bytes: data },
    });

    const result = await client.send(command);

    // Extract text blocks
    const textBlocks = result.Blocks?.filter((block) => block.BlockType === 'LINE') || [];
    const extractedText = textBlocks.map((block) => block.Text).join('\n');
    const wordCount = extractedText.split(/\s+/).filter((w) => w.length > 0).length;

    let newFragmentId = null;

    // Optionally save as a new text fragment
    if (saveAsFragment && extractedText.length > 0) {
      const newFragment = new Fragment({
        ownerId: req.user,
        type: 'text/plain',
        tags: ['extracted', 'ocr', `source:${id}`],
      });
      await newFragment.save();
      await newFragment.setData(Buffer.from(extractedText, 'utf8'));
      newFragmentId = newFragment.id;
      logger.info({ sourceId: id, newId: newFragmentId }, 'Created text fragment from image');
    }

    logger.info({ id, blockCount: textBlocks.length, wordCount }, 'Text extracted from image');

    res.status(200).json(
      createSuccessResponse({
        sourceFragment: id,
        extractedText,
        blockCount: textBlocks.length,
        wordCount,
        newFragmentId,
        blocks: textBlocks.map((block) => ({
          text: block.Text,
          confidence: block.Confidence,
          geometry: block.Geometry?.BoundingBox,
        })),
      })
    );
  } catch (err) {
    logger.error({ err, id }, 'Error extracting text from image');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

/**
 * POST /v1/fragments/:id/detect-labels
 * Detect labels in an image fragment using Amazon Rekognition
 * Body: { maxLabels: number, minConfidence: number, autoTag: boolean }
 */
const detectLabels = async (req, res) => {
  const { id } = req.params;
  const { maxLabels = 10, minConfidence = 70, autoTag = false } = req.body || {};

  try {
    const fragment = await Fragment.byId(req.user, id);

    // Verify it's an image
    if (!fragment.isImage()) {
      return res.status(400).json(createErrorResponse(400, 'Label detection only works on image fragments'));
    }

    const data = await fragment.getData();

    // Call Amazon Rekognition
    const { RekognitionClient, DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
    const client = new RekognitionClient({ region: process.env.AWS_REGION || 'us-east-1' });

    const command = new DetectLabelsCommand({
      Image: { Bytes: data },
      MaxLabels: maxLabels,
      MinConfidence: minConfidence,
    });

    const result = await client.send(command);

    const labels = result.Labels.map((label) => ({
      name: label.Name,
      confidence: Math.round(label.Confidence * 100) / 100,
      categories: label.Categories?.map((c) => c.Name) || [],
      parents: label.Parents?.map((p) => p.Name) || [],
    }));

    // Optionally auto-tag the fragment
    if (autoTag) {
      const tagNames = labels.map((l) => l.name.toLowerCase());
      await fragment.addTags(tagNames);
    }

    logger.info({ id, labelCount: labels.length, autoTag }, 'Labels detected in image');

    res.status(200).json(
      createSuccessResponse({
        fragmentId: id,
        labelCount: labels.length,
        labels,
        tags: autoTag ? fragment.tags : undefined,
      })
    );
  } catch (err) {
    logger.error({ err, id }, 'Error detecting labels in image');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

module.exports = { extractText, detectLabels };

