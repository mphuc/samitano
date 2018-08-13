'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services'); /*para llamar a la function createToken*/
var speakeasy = require('speakeasy');
var request = require('request');


function getAuthy(req, res) {
    if (req.session.authyId && req.session.userId) {
        return res.redirect('/dashboard');
    }
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.render('login/authen', {
        success: req.flash('success')[0],
        errors: req.flash('error'),
        title: 'Login',
        page:'authen',
        layout: 'layout_login.hbs'
    });
}



function checkAuthy(req, res) {
    if (req.body.authenticator && req.session.userId) {

        User.findById(req.session.userId, (err, users) => {
            if (err) return res.status(404).send({
                message: 'The two-factor authentication code you specified is incorrect. Please check the clock on your authenticator device to verify that it is in sync.'
            });
            if (!users) return res.status(404).send({
                message: 'The two-factor authentication code you specified is incorrect. Please check the clock on your authenticator device to verify that it is in sync.'
            });
            var verified = speakeasy.totp.verify({
                secret: users.security.two_factor_auth.code,
                encoding: 'base32',
                token: req.body.authenticator
            });
            if (verified) {
                req.session.authyId = service.createToken(users);
                return res.status(200).send({
                    message: ' '
                });
            } else {
                return res.status(404).send({
                    message: 'The two-factor authentication code you specified is incorrect. Please check the clock on your authenticator device to verify that it is in sync.'
                });
            }
        })



    } else {
        return res.status(404).send({
            message: 'The two-factor authentication code you specified is incorrect. Please check the clock on your authenticator device to verify that it is in sync.'
        });
    }
}

function logOut(req, res) {
    delete req.session.userId;
    delete req.session.authyId;
    return res.redirect('/signIn');
}
module.exports = {
    getAuthy,
    logOut,
    checkAuthy
}