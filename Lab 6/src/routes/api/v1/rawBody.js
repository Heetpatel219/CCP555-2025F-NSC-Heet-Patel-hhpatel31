const express = require('express');
const contentType = require('content-type');
const Fragment = require('../../../model/fragment');

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const type = contentType.parse(req).type;
        return Fragment.isSupportedType(type);
      } catch {
        return false;
      }
    },
  });

module.exports = rawBody;
