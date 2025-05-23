#!/bin/sh
# Husky
# v9 shim - prevents commit if hook fails
if [ "$HUSKY" = "0" ]; then
  exit 0
fi
