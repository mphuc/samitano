'use strict'

const mongoose = require('mongoose');

const service = require('../../services');
const moment = require('moment');
const bitcoin = require('bitcoin');
var config = require('../../config');
const Chart = require('../../models/exchange/chart').module();
const MarketHistory = require('../../models/exchange/markethistory').module();
const Volume = require('../../models/exchange/volume').module();
const cron = require('node-cron');
var _ = require('lodash');
var sleep = require('sleep');



cron.schedule('*/5 * * * *', function(){ // 5 min chart 6h
  //auto_push_chart('BTC-SVA','6h');
});

cron.schedule('*/20 * * * *', function(){ // 20 min chart 24h
 //auto_push_chart('BTC-SVA','24h');
});

cron.schedule('0 */1 * * *', function(){ // 60 min chart 3d
  //auto_push_chart('BTC-SVA','3d');
});

cron.schedule('0 */2 * * *', function(){ // 140 min chart 1w
  //auto_push_chart('BTC-SVA','1w');
});

cron.schedule('0 */4 * * *', function(){ // 280 min chart 2w
  //auto_push_chart('BTC-SVA','2w');
});

//auto_push_chart_60('BTC-SFCC');
//Create_itemchart('BTC-SVA');

	//var data = {"Result":null,"Records":null,"Data":[{"t":1513716000000,"a":0.00068000,"h":0.00068000,"l":0.00067975,"b":0.00067975,"v":0.40123522},{"t":1513716300000,"a":0.00067880,"h":0.00068500,"l":0.00067020,"b":0.00068100,"v":1.25003956},{"t":1513716600000,"a":0.00068500,"h":0.00069800,"l":0.00068110,"b":0.00069600,"v":0.63112933},{"t":1513716900000,"a":0.00069600,"h":0.00069600,"l":0.00068500,"b":0.00068990,"v":1.25700602},{"t":1513717200000,"a":0.00068990,"h":0.00069000,"l":0.00068000,"b":0.00068400,"v":1.30627365},{"t":1513717500000,"a":0.00068400,"h":0.00069000,"l":0.00068400,"b":0.00068700,"v":0.77867464},{"t":1513717800000,"a":0.00068400,"h":0.00068700,"l":0.00067975,"b":0.00068000,"v":0.80218137},{"t":1513718100000,"a":0.00067999,"h":0.00068700,"l":0.00067999,"b":0.00068700,"v":0.95159517},{"t":1513718400000,"a":0.00068700,"h":0.00068999,"l":0.00067975,"b":0.00068810,"v":1.52853473},{"t":1513718700000,"a":0.00068810,"h":0.00068810,"l":0.00067999,"b":0.00068000,"v":1.10017577},{"t":1513719000000,"a":0.00068000,"h":0.00068400,"l":0.00067975,"b":0.00068400,"v":1.17779766},{"t":1513719300000,"a":0.00068400,"h":0.00068999,"l":0.00068400,"b":0.00068410,"v":1.01158034},{"t":1513719600000,"a":0.00068410,"h":0.00068500,"l":0.00068010,"b":0.00068410,"v":2.78853779},{"t":1513719900000,"a":0.00068410,"h":0.00068410,"l":0.00067975,"b":0.00067975,"v":1.52592704},{"t":1513720200000,"a":0.00067900,"h":0.00067976,"l":0.00067501,"b":0.00067502,"v":1.13698940},{"t":1513720500000,"a":0.00067502,"h":0.00067502,"l":0.00067300,"b":0.00067300,"v":1.11031650},{"t":1513720800000,"a":0.00067300,"h":0.00067500,"l":0.00067020,"b":0.00067300,"v":0.80845572},{"t":1513721100000,"a":0.00067090,"h":0.00067300,"l":0.00066000,"b":0.00067000,"v":0.76692633},{"t":1513721400000,"a":0.00066975,"h":0.00067300,"l":0.00066000,"b":0.00066800,"v":1.56586185},{"t":1513721700000,"a":0.00066800,"h":0.00066800,"l":0.00064900,"b":0.00065000,"v":1.42731392},{"t":1513722000000,"a":0.00065000,"h":0.00066790,"l":0.00065000,"b":0.00065000,"v":1.29401760},{"t":1513722300000,"a":0.00065000,"h":0.00065000,"l":0.00064900,"b":0.00065000,"v":2.18803275},{"t":1513722600000,"a":0.00064900,"h":0.00065000,"l":0.00063600,"b":0.00064000,"v":1.29842844},{"t":1513722900000,"a":0.00064000,"h":0.00064000,"l":0.00062000,"b":0.00063000,"v":2.27692840},{"t":1513723200000,"a":0.00063000,"h":0.00063635,"l":0.00062000,"b":0.00063635,"v":1.24065071},{"t":1513723500000,"a":0.00063635,"h":0.00065000,"l":0.00063600,"b":0.00065000,"v":1.11579112},{"t":1513723800000,"a":0.00064799,"h":0.00065000,"l":0.00064000,"b":0.00064799,"v":0.85993627},{"t":1513724100000,"a":0.00064799,"h":0.00065000,"l":0.00064799,"b":0.00065000,"v":1.27129937},{"t":1513724400000,"a":0.00065000,"h":0.00065000,"l":0.00064800,"b":0.00064900,"v":0.94665070},{"t":1513724700000,"a":0.00064999,"h":0.00065000,"l":0.00064799,"b":0.00065000,"v":0.83365854},{"t":1513725000000,"a":0.00065000,"h":0.00065000,"l":0.00064999,"b":0.00065000,"v":1.24959216},{"t":1513725300000,"a":0.00065000,"h":0.00065000,"l":0.00064799,"b":0.00065000,"v":1.23432270},{"t":1513725600000,"a":0.00064798,"h":0.00064798,"l":0.00063500,"b":0.00063500,"v":1.19668700},{"t":1513725900000,"a":0.00063500,"h":0.00064800,"l":0.00061230,"b":0.00064797,"v":2.92806627},{"t":1513726200000,"a":0.00064797,"h":0.00064990,"l":0.00063500,"b":0.00064798,"v":1.04125158},{"t":1513726500000,"a":0.00064800,"h":0.00065000,"l":0.00064798,"b":0.00064980,"v":0.71310722},{"t":1513726800000,"a":0.00065000,"h":0.00065000,"l":0.00064798,"b":0.00064798,"v":0.99605254},{"t":1513727100000,"a":0.00064798,"h":0.00064980,"l":0.00064500,"b":0.00064980,"v":0.75282609},{"t":1513727400000,"a":0.00064800,"h":0.00064980,"l":0.00064000,"b":0.00064798,"v":1.23733249},{"t":1513727700000,"a":0.00064798,"h":0.00065000,"l":0.00064000,"b":0.00064999,"v":1.24954900},{"t":1513728000000,"a":0.00064999,"h":0.00065000,"l":0.00064900,"b":0.00064900,"v":1.19529266},{"t":1513728300000,"a":0.00064900,"h":0.00065000,"l":0.00064800,"b":0.00064900,"v":1.65299507},{"t":1513728600000,"a":0.00064900,"h":0.00065000,"l":0.00064900,"b":0.00064980,"v":1.39205254},{"t":1513728900000,"a":0.00064980,"h":0.00065000,"l":0.00064800,"b":0.00064900,"v":1.07430954},{"t":1513729200000,"a":0.00064810,"h":0.00065999,"l":0.00064800,"b":0.00065999,"v":2.18165266},{"t":1513729500000,"a":0.00066000,"h":0.00066790,"l":0.00065000,"b":0.00066700,"v":1.86973157},{"t":1513729800000,"a":0.00066600,"h":0.00066790,"l":0.00065100,"b":0.00065100,"v":0.90713438},{"t":1513730100000,"a":0.00066000,"h":0.00066700,"l":0.00066000,"b":0.00066700,"v":1.00070894},{"t":1513730400000,"a":0.00066700,"h":0.00066790,"l":0.00066600,"b":0.00066700,"v":1.23335301},{"t":1513730700000,"a":0.00066700,"h":0.00066790,"l":0.00066000,"b":0.00066780,"v":0.75502833},{"t":1513731000000,"a":0.00066700,"h":0.00066700,"l":0.00065000,"b":0.00066400,"v":1.27796233},{"t":1513731300000,"a":0.00066500,"h":0.00066500,"l":0.00064990,"b":0.00064990,"v":0.65393781},{"t":1513731600000,"a":0.00066400,"h":0.00066400,"l":0.00064980,"b":0.00065000,"v":0.69736387},{"t":1513731900000,"a":0.00065000,"h":0.00066500,"l":0.00064980,"b":0.00066400,"v":0.97442069},{"t":1513732200000,"a":0.00066300,"h":0.00066400,"l":0.00065100,"b":0.00066000,"v":0.69169601},{"t":1513732500000,"a":0.00065300,"h":0.00066000,"l":0.00065000,"b":0.00065400,"v":1.29100549},{"t":1513732800000,"a":0.00065000,"h":0.00066000,"l":0.00064900,"b":0.00065980,"v":2.41514674},{"t":1513733100000,"a":0.00065444,"h":0.00066300,"l":0.00065000,"b":0.00065990,"v":1.54380465},{"t":1513733400000,"a":0.00066200,"h":0.00066200,"l":0.00065000,"b":0.00065980,"v":2.92501906},{"t":1513733700000,"a":0.00065980,"h":0.00066100,"l":0.00065980,"b":0.00066100,"v":1.10955021},{"t":1513734000000,"a":0.00065999,"h":0.00066600,"l":0.00065999,"b":0.00066400,"v":0.79096693},{"t":1513734300000,"a":0.00066500,"h":0.00066500,"l":0.00066200,"b":0.00066380,"v":1.45235274},{"t":1513734600000,"a":0.00066380,"h":0.00066390,"l":0.00066200,"b":0.00066390,"v":1.13023733},{"t":1513734900000,"a":0.00066400,"h":0.00066679,"l":0.00066380,"b":0.00066390,"v":1.91446658},{"t":1513735200000,"a":0.00066390,"h":0.00066700,"l":0.00066300,"b":0.00066500,"v":1.45128025},{"t":1513735500000,"a":0.00066700,"h":0.00066770,"l":0.00066390,"b":0.00066700,"v":1.04326420},{"t":1513735800000,"a":0.00066700,"h":0.00066790,"l":0.00066700,"b":0.00066700,"v":0.96008234},{"t":1513736100000,"a":0.00066710,"h":0.00066974,"l":0.00066700,"b":0.00066974,"v":1.53639021},{"t":1513736400000,"a":0.00066975,"h":0.00066975,"l":0.00066791,"b":0.00066974,"v":0.79407857},{"t":1513736700000,"a":0.00066974,"h":0.00066975,"l":0.00066800,"b":0.00066900,"v":1.93730658},{"t":1513737000000,"a":0.00066900,"h":0.00067000,"l":0.00066800,"b":0.00066990,"v":0.71180420},{"t":1513737300000,"a":0.00067000,"h":0.00067976,"l":0.00066990,"b":0.00067976,"v":0.85960484},{"t":1513737600000,"a":0.00067975,"h":0.00068000,"l":0.00067210,"b":0.00067999,"v":1.05635856}],"TotalRecordCount":0,"StatusCode":0,"Message":null};
/*var data = [{"id":"11461","open":"0.02214863","close":"0.02214863","high":"0.02214899","low":"0.0221485","volume":"1.00211417","close_usd":"370.79","created_on":"2017-12-20 19:55:01","time_stamp":"1513799701"},{"id":"11462","open":"0.02214863","close":"0.02215248","high":"0.0221526","low":"0.02214863","volume":"2.49862722","close_usd":"370.86","created_on":"2017-12-20 20:00:01","time_stamp":"1513800001"},{"id":"11463","open":"0.02215248","close":"0.02215301","high":"0.02215443","low":"0.02215248","volume":"1.95606895","close_usd":"372.85","created_on":"2017-12-20 20:05:02","time_stamp":"1513800302"},{"id":"11464","open":"0.02215393","close":"0.0221566","high":"0.0221566","low":"0.02215393","volume":"2.23157433","close_usd":"372.91","created_on":"2017-12-20 20:10:01","time_stamp":"1513800601"},{"id":"11465","open":"0.02215612","close":"0.02215661","high":"0.0221567","low":"0.02215497","volume":"1.53100766","close_usd":"370.17","created_on":"2017-12-20 20:15:01","time_stamp":"1513800901"},{"id":"11466","open":"0.02215663","close":"0.02215672","high":"0.02215672","low":"0.02215661","volume":"1.34802477","close_usd":"370.18","created_on":"2017-12-20 20:20:02","time_stamp":"1513801202"},{"id":"11467","open":"0.02215672","close":"0.02215672","high":"0.022157","low":"0.02215672","volume":"1.01580013","close_usd":"371.87","created_on":"2017-12-20 20:25:01","time_stamp":"1513801501"},{"id":"11468","open":"0.02215672","close":"0.02216044","high":"0.02216044","low":"0.02215672","volume":"2.42927914","close_usd":"371.93","created_on":"2017-12-20 20:30:02","time_stamp":"1513801802"},{"id":"11469","open":"0.0221569","close":"0.02215672","high":"0.02216043","low":"0.02215672","volume":"1.27843949","close_usd":"372.38","created_on":"2017-12-20 20:35:02","time_stamp":"1513802102"},{"id":"11470","open":"0.02215672","close":"0.02216044","high":"0.0221605","low":"0.02215671","volume":"4.95495334","close_usd":"372.44","created_on":"2017-12-20 20:40:01","time_stamp":"1513802401"},{"id":"11471","open":"0.02216044","close":"0.02216046","high":"0.0221605","low":"0.02216044","volume":"0.72088782","close_usd":"370.57","created_on":"2017-12-20 20:45:01","time_stamp":"1513802701"},{"id":"11472","open":"0.02216046","close":"0.022161","high":"0.022161","low":"0.02216046","volume":"0.94892059","close_usd":"370.58","created_on":"2017-12-20 20:50:01","time_stamp":"1513803001"},{"id":"11473","open":"0.0221615","close":"0.02216157","high":"0.02216158","low":"0.0221615","volume":"1.01452669","close_usd":"373.08","created_on":"2017-12-20 20:55:02","time_stamp":"1513803302"},{"id":"11474","open":"0.02216157","close":"0.02216157","high":"0.02216158","low":"0.02216157","volume":"1.19317645","close_usd":"373.08","created_on":"2017-12-20 21:00:02","time_stamp":"1513803602"},{"id":"11475","open":"0.02216157","close":"0.02216154","high":"0.02216157","low":"0.022161","volume":"1.48190083","close_usd":"370.18","created_on":"2017-12-20 21:05:01","time_stamp":"1513803901"},{"id":"11476","open":"0.02216157","close":"0.022161","high":"0.02216157","low":"0.022161","volume":"2.4038783","close_usd":"370.17","created_on":"2017-12-20 21:10:02","time_stamp":"1513804202"},{"id":"11477","open":"0.022161","close":"0.02216153","high":"0.02216154","low":"0.022161","volume":"1.12823008","close_usd":"368.1","created_on":"2017-12-20 21:15:02","time_stamp":"1513804502"},{"id":"11478","open":"0.02216153","close":"0.02216153","high":"0.02216154","low":"0.02216153","volume":"3.16050737","close_usd":"368.1","created_on":"2017-12-20 21:20:02","time_stamp":"1513804802"},{"id":"11479","open":"0.02216153","close":"0.02216153","high":"0.02216154","low":"0.02216153","volume":"2.49575628","close_usd":"367.95","created_on":"2017-12-20 21:25:02","time_stamp":"1513805102"},{"id":"11480","open":"0.02216153","close":"0.02216154","high":"0.02216157","low":"0.022161","volume":"3.89971256","close_usd":"367.95","created_on":"2017-12-20 21:30:02","time_stamp":"1513805402"},{"id":"11481","open":"0.02216154","close":"0.02216155","high":"0.02216157","low":"0.022161","volume":"1.01890663","close_usd":"365.74","created_on":"2017-12-20 21:35:02","time_stamp":"1513805702"},{"id":"11482","open":"0.02216155","close":"0.02216155","high":"0.02216156","low":"0.02216155","volume":"0.85539438","close_usd":"365.74","created_on":"2017-12-20 21:40:01","time_stamp":"1513806001"},{"id":"11483","open":"0.02216155","close":"0.02216155","high":"0.02216156","low":"0.02216155","volume":"1.74802852","close_usd":"360.22","created_on":"2017-12-20 21:45:01","time_stamp":"1513806301"},{"id":"11484","open":"0.02216155","close":"0.02216155","high":"0.02216157","low":"0.02216154","volume":"1.16501567","close_usd":"360.22","created_on":"2017-12-20 21:50:02","time_stamp":"1513806602"},{"id":"11485","open":"0.02216155","close":"0.02216155","high":"0.02216157","low":"0.02216155","volume":"1.20222634","close_usd":"361.03","created_on":"2017-12-20 21:55:01","time_stamp":"1513806901"},{"id":"11486","open":"0.02216155","close":"0.02216155","high":"0.02216156","low":"0.02216155","volume":"1.22554402","close_usd":"361.03","created_on":"2017-12-20 22:00:02","time_stamp":"1513807202"},{"id":"11487","open":"0.02216155","close":"0.022161","high":"0.02216157","low":"0.022161","volume":"1.72713914","close_usd":"361.53","created_on":"2017-12-20 22:05:01","time_stamp":"1513807501"},{"id":"11488","open":"0.022161","close":"0.02216047","high":"0.0221615","low":"0.02216047","volume":"4.09102769","close_usd":"361.52","created_on":"2017-12-20 22:10:02","time_stamp":"1513807802"},{"id":"11489","open":"0.02216047","close":"0.02216047","high":"0.02216155","low":"0.02216047","volume":"2.07829601","close_usd":"354.82","created_on":"2017-12-20 22:15:01","time_stamp":"1513808101"},{"id":"11490","open":"0.02216047","close":"0.02216047","high":"0.02216158","low":"0.02216047","volume":"1.15021632","close_usd":"354.82","created_on":"2017-12-20 22:20:02","time_stamp":"1513808402"},{"id":"11491","open":"0.02216048","close":"0.02216047","high":"0.02217044","low":"0.02216047","volume":"3.01699698","close_usd":"351.66","created_on":"2017-12-20 22:25:01","time_stamp":"1513808701"},{"id":"11492","open":"0.02216047","close":"0.02216048","high":"0.02217044","low":"0.02216047","volume":"1.74170647","close_usd":"351.66","created_on":"2017-12-20 22:30:02","time_stamp":"1513809002"},{"id":"11493","open":"0.02216048","close":"0.02215443","high":"0.02216048","low":"0.02215443","volume":"1.06662393","close_usd":"354.55","created_on":"2017-12-20 22:35:02","time_stamp":"1513809302"},{"id":"11494","open":"0.02215448","close":"0.0221484","high":"0.02215449","low":"0.0221484","volume":"2.0895126","close_usd":"354.46","created_on":"2017-12-20 22:40:01","time_stamp":"1513809601"},{"id":"11495","open":"0.0221484","close":"0.02214029","high":"0.0221484","low":"0.02214","volume":"5.6162094","close_usd":"359.68","created_on":"2017-12-20 22:45:02","time_stamp":"1513809902"},{"id":"11496","open":"0.02214029","close":"0.0221402","high":"0.02214703","low":"0.022138","volume":"1.25742747","close_usd":"359.67","created_on":"2017-12-20 22:50:02","time_stamp":"1513810202"},{"id":"11497","open":"0.0221402","close":"0.0221402","high":"0.022147","low":"0.0221402","volume":"1.10009526","close_usd":"362.39","created_on":"2017-12-20 22:55:01","time_stamp":"1513810501"},{"id":"11498","open":"0.0221402","close":"0.022029","high":"0.0221402","low":"0.022029","volume":"1.89365717","close_usd":"360.57","created_on":"2017-12-20 23:00:02","time_stamp":"1513810802"},{"id":"11499","open":"0.022029","close":"0.0221","high":"0.0221","low":"0.022029","volume":"2.35691017","close_usd":"361.55","created_on":"2017-12-20 23:05:02","time_stamp":"1513811102"},{"id":"11500","open":"0.0221","close":"0.022029","high":"0.0221","low":"0.022029","volume":"2.38347469","close_usd":"360.38","created_on":"2017-12-20 23:10:01","time_stamp":"1513811401"},{"id":"11501","open":"0.022029","close":"0.022029","high":"0.0220999","low":"0.022029","volume":"0.57174362","close_usd":"358.41","created_on":"2017-12-20 23:15:02","time_stamp":"1513811702"},{"id":"11502","open":"0.022029","close":"0.0220998","high":"0.0220999","low":"0.022029","volume":"2.06843987","close_usd":"359.56","created_on":"2017-12-20 23:20:02","time_stamp":"1513812002"},{"id":"11503","open":"0.0220998","close":"0.0220998","high":"0.02209999","low":"0.022028","volume":"1.62388606","close_usd":"363.31","created_on":"2017-12-20 23:25:02","time_stamp":"1513812302"},{"id":"11504","open":"0.022029","close":"0.02202997","high":"0.02209999","low":"0.022028","volume":"0.41520032","close_usd":"362.16","created_on":"2017-12-20 23:30:02","time_stamp":"1513812602"},{"id":"11505","open":"0.022029","close":"0.0220265","high":"0.02209","low":"0.0220265","volume":"4.98010634","close_usd":"361.93","created_on":"2017-12-20 23:35:01","time_stamp":"1513812901"},{"id":"11506","open":"0.02202607","close":"0.02202607","high":"0.02202658","low":"0.02202606","volume":"1.04904818","close_usd":"361.92","created_on":"2017-12-20 23:40:01","time_stamp":"1513813201"},{"id":"11507","open":"0.02202607","close":"0.02202608","high":"0.02202688","low":"0.02202606","volume":"2.5475958","close_usd":"364.58","created_on":"2017-12-20 23:45:01","time_stamp":"1513813501"},{"id":"11508","open":"0.02202608","close":"0.0220989","high":"0.0220989","low":"0.02202606","volume":"3.01808076","close_usd":"365.78","created_on":"2017-12-20 23:50:02","time_stamp":"1513813802"},{"id":"11509","open":"0.0220989","close":"0.0220989","high":"0.022099","low":"0.02202688","volume":"2.94853374","close_usd":"364.49","created_on":"2017-12-20 23:55:01","time_stamp":"1513814101"},{"id":"11510","open":"0.0220989","close":"0.02207","high":"0.0220998","low":"0.02207","volume":"2.53972646","close_usd":"364.01","created_on":"2017-12-21 00:00:02","time_stamp":"1513814402"},{"id":"11511","open":"0.02207","close":"0.02202688","high":"0.0220788","low":"0.02202606","volume":"3.85218418","close_usd":"364.44","created_on":"2017-12-21 00:05:01","time_stamp":"1513814701"},{"id":"11512","open":"0.02202688","close":"0.022028","high":"0.02206999","low":"0.02202688","volume":"1.72763519","close_usd":"364.46","created_on":"2017-12-21 00:10:02","time_stamp":"1513815002"},{"id":"11513","open":"0.0220275","close":"0.02202608","high":"0.022055","low":"0.02202606","volume":"2.12674386","close_usd":"364.02","created_on":"2017-12-21 00:15:02","time_stamp":"1513815302"},{"id":"11514","open":"0.02202608","close":"0.02202606","high":"0.02202608","low":"0.02202606","volume":"2.64359265","close_usd":"364.02","created_on":"2017-12-21 00:20:02","time_stamp":"1513815602"},{"id":"11515","open":"0.02202606","close":"0.02202497","high":"0.02202606","low":"0.02202439","volume":"3.30910924","close_usd":"362.8","created_on":"2017-12-21 00:25:02","time_stamp":"1513815902"},{"id":"11516","open":"0.02202497","close":"0.02202439","high":"0.02202497","low":"0.02202437","volume":"1.96910408","close_usd":"362.79","created_on":"2017-12-21 00:30:02","time_stamp":"1513816202"},{"id":"11517","open":"0.02202439","close":"0.02202497","high":"0.02202608","low":"0.02202439","volume":"1.78674332","close_usd":"366.48","created_on":"2017-12-21 00:35:01","time_stamp":"1513816501"},{"id":"11518","open":"0.02202497","close":"0.022027","high":"0.0220788","low":"0.02202497","volume":"1.81703739","close_usd":"366.52","created_on":"2017-12-21 00:40:01","time_stamp":"1513816801"},{"id":"11519","open":"0.022027","close":"0.02202335","high":"0.022027","low":"0.02202335","volume":"3.48762797","close_usd":"369.5","created_on":"2017-12-21 00:45:02","time_stamp":"1513817102"},{"id":"11520","open":"0.02202335","close":"0.02202469","high":"0.02202497","low":"0.02202335","volume":"2.92937661","close_usd":"369.52","created_on":"2017-12-21 00:50:01","time_stamp":"1513817401"},{"id":"11521","open":"0.02202469","close":"0.02202469","high":"0.02202497","low":"0.02202469","volume":"2.55302609","close_usd":"369.9","created_on":"2017-12-21 00:55:01","time_stamp":"1513817701"},{"id":"11522","open":"0.02202469","close":"0.022028","high":"0.02208","low":"0.02202469","volume":"2.00109424","close_usd":"369.96","created_on":"2017-12-21 01:00:02","time_stamp":"1513818002"},{"id":"11523","open":"0.022026","close":"0.02202469","high":"0.0220989","low":"0.02202469","volume":"3.93010622","close_usd":"368.9","created_on":"2017-12-21 01:05:02","time_stamp":"1513818302"},{"id":"11524","open":"0.02202469","close":"0.02202468","high":"0.0220989","low":"0.02202468","volume":"2.24911006","close_usd":"368.9","created_on":"2017-12-21 01:10:02","time_stamp":"1513818602"},{"id":"11525","open":"0.02202468","close":"0.02202468","high":"0.02202469","low":"0.02202468","volume":"1.97413602","close_usd":"367.02","created_on":"2017-12-21 01:15:01","time_stamp":"1513818901"},{"id":"11526","open":"0.0220246","close":"0.0220246","high":"0.02202468","low":"0.0220246","volume":"3.2780098","close_usd":"367.02","created_on":"2017-12-21 01:20:01","time_stamp":"1513819201"},{"id":"11527","open":"0.0220246","close":"0.02202335","high":"0.02202467","low":"0.02202335","volume":"2.11534133","close_usd":"364.72","created_on":"2017-12-21 01:25:01","time_stamp":"1513819501"},{"id":"11528","open":"0.02202335","close":"0.02202335","high":"0.0220246","low":"0.02202335","volume":"1.71112074","close_usd":"364.72","created_on":"2017-12-21 01:30:01","time_stamp":"1513819801"},{"id":"11529","open":"0.02202335","close":"0.02202383","high":"0.02202459","low":"0.02202335","volume":"1.21300999","close_usd":"365.45","created_on":"2017-12-21 01:35:02","time_stamp":"1513820102"},{"id":"11530","open":"0.02202383","close":"0.02202336","high":"0.02202388","low":"0.02202283","volume":"2.84668692","close_usd":"365.44","created_on":"2017-12-21 01:40:02","time_stamp":"1513820402"},{"id":"11531","open":"0.02202383","close":"0.0220223","high":"0.0220239","low":"0.02202172","volume":"3.23565794","close_usd":"368.19","created_on":"2017-12-21 01:45:01","time_stamp":"1513820701"},{"id":"11532","open":"0.0220223","close":"0.0220212","high":"0.0220223","low":"0.0220212","volume":"1.24195729","close_usd":"368.17","created_on":"2017-12-21 01:50:01","time_stamp":"1513821001"}];
data.forEach(function(item){
	


	var query = {'MarketName' : 'BTC-SFCC'};
	var data_update = {
		$push: {
	        'history': {
	            'bid': item.open,
	            'ask': item.close,
	            'hight': item.high,
	            'low': item.low,
	            'volume': item.volume,
	            'date': item.time_stamp,
	            'created_on' : item.created_on
	        }
	    }
	};
	Chart.update(query, data_update, function(err, newUser) {
		console.log(newUser);
	})
})*/
function random (low, high) {
    return (Math.random() * (high - low) + low).toFixed(8);
}


function create_chart_test(MarketName)
{
	var bt_time = new Date();
	for (var i = 0; i <= 72; i++) {
			

		
		var bt_time6h = new Date(bt_time.getTime() - 60*1000*360);

		var date_new = new Date(bt_time6h.getTime() + 60*1000*5*i).toString();
		var hight = (0.00008308 + parseFloat(Math.random())/100000).toFixed(8);
		var low = (hight - parseFloat(Math.random())/1000000).toFixed(8);

		var query = {'MarketName' : MarketName};
		var data_update = {
			$push: {
	            'history6h': {
	                'open': (0.00008308 + parseFloat(Math.random())/100000).toFixed(8),
	                'close': (0.00008308 + parseFloat(Math.random())/100000).toFixed(8),
	                'hight': hight,
	                'low': low,
	                'volume': (parseInt(Math.random()*10) + parseFloat(Math.random())/100000).toFixed(8),
	                'date': new Date(date_new).getTime() * 1000,
	                'created_on' : new Date(date_new).toLocaleString()
	            }
	        }
		};
		Chart.update(query, data_update, function(err, newUser) {
			console.log(newUser);
		})
	
		/**/
		
		var bt_time24h = new Date(bt_time.getTime() - 60*1000*1440)
	
		
		var date_new = new Date(bt_time24h.getTime() + 60*1000*20*i).toString();
		var hight = (0.00008308 + parseFloat(Math.random())/100000).toFixed(8);
		var low = (hight - parseFloat(Math.random())/1000000).toFixed(8);

		var query = {'MarketName' : MarketName};
		var data_update = {
			$push: {
	            'history24h': {
	                'open': (0.00008308 + parseFloat(Math.random())/100000).toFixed(8),
	                'close': (0.00008308 + parseFloat(Math.random())/100000).toFixed(8),
	                'hight': hight,
	                'low': low,
	                'volume': (parseInt(Math.random()*10) + parseFloat(Math.random())/100000).toFixed(8),
	                'date': new Date(date_new).getTime() * 1000,
	                'created_on' : new Date(date_new).toLocaleString()
	            }
	        }
		};
		Chart.update(query, data_update, function(err, newUser) {
			console.log(newUser);
		})
	
		/**/
		
		var bt_time3d = new Date(bt_time.getTime() - 60*1000*4320)
		
		var date_new = new Date(bt_time3d.getTime() + 60*1000*60*i).toString();
		var hight = (0.00008308 + parseFloat(Math.random())/100000).toFixed(8);
		var low = (hight - parseFloat(Math.random())/1000000).toFixed(8);

		var query = {'MarketName' : MarketName};
		var data_update = {
			$push: {
	            'history3d': {
	                'open': (0.00008308 + parseFloat(Math.random())/100000).toFixed(8),
	                'close': (0.00008308 + parseFloat(Math.random())/100000).toFixed(8),
	                'hight': hight,
	                'low': low,
	                'volume': (parseInt(Math.random()*10) + parseFloat(Math.random())/100000).toFixed(8),
	                'date': new Date(date_new).getTime() * 1000,
	                'created_on' : new Date(date_new).toLocaleString()
	            }
	        }
		};
		Chart.update(query, data_update, function(err, newUser) {
			console.log(newUser);
		})
		
		/**/
		
		var bt_time1w = new Date(bt_time.getTime() - 60*1000*10080)
		
		var date_new = new Date(bt_time1w.getTime() + 60*1000*140*i).toString();
		var hight = (0.00008308 + parseFloat(Math.random())/100000).toFixed(8);
		var low = (hight - parseFloat(Math.random())/1000000).toFixed(8);

		var query = {'MarketName' : MarketName};
		var data_update = {
			$push: {
	            'history1w': {
	                'open': (0.00008308 + parseFloat(Math.random())/100000).toFixed(8),
	                'close': (0.00008308 + parseFloat(Math.random())/100000).toFixed(8),
	                'hight': hight,
	                'low': low,
	                'volume': (parseInt(Math.random()*10) + parseFloat(Math.random())/100000).toFixed(8),
	                'date': new Date(date_new).getTime() * 1000,
	                'created_on' : new Date(date_new).toLocaleString()
	            }
	        }
		};
		Chart.update(query, data_update, function(err, newUser) {
			console.log(newUser);
		})

		/**/
	
		
		var bt_time2w = new Date(bt_time.getTime() - 60*1000*20160)
	
		var date_new = new Date(bt_time2w.getTime() + 60*1000*280*i).toString();
		var hight = (0.00008308 + parseFloat(Math.random())/100000).toFixed(8);
		var low = (hight - parseFloat(Math.random())/1000000).toFixed(8);

		var query = {'MarketName' : MarketName};
		var data_update = {
			$push: {
	            'history2w': {
	                'open': (0.00008308 + parseFloat(Math.random())/100000).toFixed(8),
	                'close': (0.00008308 + parseFloat(Math.random())/100000).toFixed(8),
	                'hight': hight,
	                'low': low,
	                'volume': (parseInt(Math.random()*10) + parseFloat(Math.random())/100000).toFixed(8),
	                'date': new Date(date_new).getTime() * 1000,
	                'created_on' : new Date(date_new).toLocaleString()
	            }
	        }
		};
		Chart.update(query, data_update, function(err, newUser) {
			console.log(newUser);
		})

		
	}

}




function Create_itemchart(MarketName){
	Chart.find({'MarketName' : MarketName},function(err,result){
		var newChart;
		var today = moment();
		result.length === 0 && (
			newChart = new Chart(),
	        newChart.MarketName = MarketName,
	        newChart.date =  moment(today).format(),
	        newChart.save( (err) => {
	        	create_chart_test(MarketName);
	        })
		)
	})
}

function Sortobject(object,callback){
	callback(_.sortBy(object, [function(o) { return parseFloat(o.price); }]));
}
function sumObject(object,callback){
	callback(_.sumBy(object, function(o) { return parseFloat(o.total); }));
}

function auto_push_chart(MarketName,Min) {
	var today = moment();
	var date_serach;
	var history;
	if (Min == '6h'){
		date_serach = { $and : [{"MarketName" : MarketName},{
			    "date": { $gte: new Date((new Date().getTime() - (5 * 60 * 1000)))}
			}]
		};
		history = history+'6h';
	}
	if (Min == '24h'){
		date_serach = { $and : [{"MarketName" : MarketName},{
			    "date": { $gte: new Date((new Date().getTime() - (20 * 60 * 1000)))}
			}]
		};
		history = history+'24h';
	}
	if (Min == '3d'){
		date_serach = { $and : [{"MarketName" : MarketName},{
			    "date": { $gte: new Date((new Date().getTime() - (60 * 60 * 1000)))}
			}]
		};
		history = history+'3d';
	}
	if (Min == '1w'){
		date_serach = { $and : [{"MarketName" : MarketName},{
			    "date": { $gte: new Date((new Date().getTime() - (140 * 60 * 1000)))}
			}]
		};
		history = history+'1w';
	}
	if (Min == '2w'){
		date_serach = { $and : [{"MarketName" : MarketName},{
			    "date": { $gte: new Date((new Date().getTime() - (280 * 60 * 1000)))}
			}]
		};
		history = history+'2w';
	}


	MarketHistory.find(date_serach,function(err,result_market){
		var query = {'MarketName' : MarketName};
		var data_update, open,close,hight,low,volume,count_array;

		console.log(err,result_market);

		!err && result_market.length > 0 ?
		(	
			count_array = result_market.length,
			Sortobject(result_market,function(sort){
				hight = sort[count_array-1].price;
				low = sort[0].price;
				open = result_market[0].price,
				close = result_market[count_array-1].price,
				sumObject(result_market,function(volume){

					console.log(hight,low,open,close,volume);

					Min == '6h' && (
						data_update = {
							$push: {
				                history6h: {
				                    'open': (parseFloat(open))/100000000,
				                    'close': (parseFloat(close))/100000000,
				                    'hight': (parseFloat(hight))/100000000,
				                    'low': (parseFloat(low))/100000000,
				                    'volume': ((parseFloat(volume))/100000000).toFixed(8),
				                    'date': new Date().getTime() * 1000,
				                    'created_on' : new Date().toLocaleString()
				                }
				            }
						}
					),
					Min == '24h' && (
						data_update = {
							$push: {
				                history24h: {
				                    'open': (parseFloat(open))/100000000,
				                    'close': (parseFloat(close))/100000000,
				                    'hight': (parseFloat(hight))/100000000,
				                    'low': (parseFloat(low))/100000000,
				                    'volume': ((parseFloat(volume))/100000000).toFixed(8),
				                    'date': new Date().getTime() * 1000,
				                    'created_on' : new Date().toLocaleString()
				                }
				            }
						}
					),
					Min == '3d' && (
						data_update = {
							$push: {
				                history3d: {
				                    'open': (parseFloat(open))/100000000,
				                    'close': (parseFloat(close))/100000000,
				                    'hight': (parseFloat(hight))/100000000,
				                    'low': (parseFloat(low))/100000000,
				                    'volume': ((parseFloat(volume))/100000000).toFixed(8),
				                    'date': new Date().getTime() * 1000,
				                    'created_on' : new Date().toLocaleString()
				                }
				            }
						}
					),
					Min == '1w' && (
						data_update = {
							$push: {
				                history3d: {
				                    'open': (parseFloat(open))/100000000,
				                    'close': (parseFloat(close))/100000000,
				                    'hight': (parseFloat(hight))/100000000,
				                    'low': (parseFloat(low))/100000000,
				                    'volume': ((parseFloat(volume))/100000000).toFixed(8),
				                    'date': new Date().getTime() * 1000,
				                    'created_on' : new Date().toLocaleString()
				                }
				            }
						}
					),
					Min == '2w' && (
						data_update = {
							$push: {
				                history3d: {
				                    'open': (parseFloat(open))/100000000,
				                    'close': (parseFloat(close))/100000000,
				                    'hight': (parseFloat(hight))/100000000,
				                    'low': (parseFloat(low))/100000000,
				                    'volume': ((parseFloat(volume))/100000000).toFixed(8),
				                    'date': new Date().getTime() * 1000,
				                    'created_on' : new Date().toLocaleString()
				                }
				            }
						}
					),

					Chart.update(query, data_update, function(err, newUser) {
						console.log(newUser);
					})
				})	
			})
		) : (
			Volume.findOne({'MarketName' : MarketName},function(err,result_volume){

				hight = (parseFloat(result_volume.last)/100000000 + parseFloat(random(0.00001,0.00009))).toFixed(8);
				low = (Math.abs(hight - parseFloat(random(0.00001,0.00009)))).toFixed(8);
				/*history24h: {
				    'open': (parseFloat(result_volume.last))/100000000,
				    'close': (parseFloat(result_volume.last))/100000000,
				    'hight': (parseFloat(result_volume.last))/100000000,
				    'low': (parseFloat(result_volume.last))/100000000,
				    'volume': (parseFloat(Math.random())).toFixed(8),
				    'date': new Date().getTime() * 1000,
				    'created_on' : new Date().toLocaleString()
				}*/
				Min == '6h' && (
					data_update = {
						$push: {
			                history6h: {
			                    'open': (parseFloat(result_volume.last))/100000000,
							    'close': (parseFloat(result_volume.last))/100000000,
							    'hight': (parseFloat(result_volume.last))/100000000,
							    'low': (parseFloat(result_volume.last))/100000000,
							    'volume': (parseFloat(Math.random())).toFixed(8),
							    'date': new Date().getTime() * 1000,
							    'created_on' : new Date().toLocaleString()
			                }
			            }
					}
				);
				Min == '24h' && (
					data_update = {
						$push: {
			                history24h: {
			                    'open': (parseFloat(result_volume.last))/100000000,
							    'close': (parseFloat(result_volume.last))/100000000,
							    'hight': (parseFloat(result_volume.last))/100000000,
							    'low': (parseFloat(result_volume.last))/100000000,
							    'volume': (parseFloat(Math.random())).toFixed(8),
							    'date': new Date().getTime() * 1000,
							    'created_on' : new Date().toLocaleString()
			                }
			            }
					}
				);
				Min == '3d' && (
					data_update = {
						$push: {
			                history3d: {
			                    'open': (parseFloat(result_volume.last))/100000000,
							    'close': (parseFloat(result_volume.last))/100000000,
							    'hight': (parseFloat(result_volume.last))/100000000,
							    'low': (parseFloat(result_volume.last))/100000000,
							    'volume': (parseFloat(Math.random())).toFixed(8),
							    'date': new Date().getTime() * 1000,
							    'created_on' : new Date().toLocaleString()
			                }
			            }
					}
				);
				Min == '1w' && (
					data_update = {
						$push: {
			                history1w: {
			                    'open': (parseFloat(result_volume.last))/100000000,
							    'close': (parseFloat(result_volume.last))/100000000,
							    'hight': (parseFloat(result_volume.last))/100000000,
							    'low': (parseFloat(result_volume.last))/100000000,
							    'volume': (parseFloat(Math.random())).toFixed(8),
							    'date': new Date().getTime() * 1000,
							    'created_on' : new Date().toLocaleString()
			                }
			            }
					}
				);
				Min == '2w' && (
					data_update = {
						$push: {
			                history2w: {
			                    'open': (parseFloat(result_volume.last))/100000000,
							    'close': (parseFloat(result_volume.last))/100000000,
							    'hight': (parseFloat(result_volume.last))/100000000,
							    'low': (parseFloat(result_volume.last))/100000000,
							    'volume': (parseFloat(Math.random())).toFixed(8),
							    'date': new Date().getTime() * 1000,
							    'created_on' : new Date().toLocaleString()
			                }
			            }
					}
				);
				Chart.update(query, data_update, function(err, newUser) {
					console.log(newUser);
				})
			})
		)
	})
}

module.exports = {
	
}