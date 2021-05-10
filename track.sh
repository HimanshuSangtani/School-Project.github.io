#!/bin/bash
echo track.zuwagon.com
aws s3 ls s3://track.zuwagon.com
aws s3 sync ./assets s3://track.zuwagon.com/assets --delete
aws s3 sync ./login s3://track.zuwagon.com/login --delete
aws s3 sync ./src s3://track.zuwagon.com/src --delete
aws s3 sync ./templates s3://track.zuwagon.com/templates --delete
aws s3 cp ./index.html s3://track.zuwagon.com
aws s3 cp ./admin-min.js s3://track.zuwagon.com
aws s3 cp ./pdfExpoUtil.js s3://track.zuwagon.com
aws s3 ls s3://track.zuwagon.com
aws s3 ls s3://track.zuwagon.com