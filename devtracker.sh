#!/bin/bash
echo devtracker.zuwagon.com
aws s3 ls s3://devtracker.zuwagon.com
aws s3 sync ./assets s3://devtracker.zuwagon.com/assets --delete
aws s3 sync ./login s3://devtracker.zuwagon.com/login --delete
aws s3 sync ./src s3://devtracker.zuwagon.com/src --delete
aws s3 sync ./templates s3://devtracker.zuwagon.com/templates --delete
aws s3 cp ./index.html s3://devtracker.zuwagon.com
aws s3 cp ./admin-min.js s3://devtracker.zuwagon.com
aws s3 cp ./pdfExpoUtil.js s3://devtracker.zuwagon.com
aws s3 ls s3://devtracker.zuwagon.com
aws s3 ls s3://devtracker.zuwagon.com