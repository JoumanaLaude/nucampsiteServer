const express = require('express');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');

const campsiteRouter = express.Router();

// this file handles the get, put, post, delete of anything that begins with /campsites

// updated endpoints to interact w/ mongodb server thru mongoose model methods
campsiteRouter.route('/')
    .get((req, res, next) => {
        Campsite.find() // static mongoose method via campsite model that finds all documents
        // a mongoose method will always return a promise
            .then(campsites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsites); // sends json data to client in resp string which closes afterward (so you don't need .end)
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        // authenticate.verifyUser means you have to be authorized to access these endpoints
        Campsite.create(req.body) // express middleware will parse it, mongoose will let us know if data is wrong
            .then(campsite => {
                console.log('Campsite Created ', campsite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

campsiteRouter.route('/:campsiteId')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId) // this id is getting parsed from the http req from the id the user types in
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Campsite.findByIdAndUpdate(req.params.campsiteId, {
            $set: req.body
        }, { new: true }) // get back updated document as result
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.findByIdAndDelete(req.params.campsiteId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

    campsiteRouter.route('/:campsiteId/comments')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId) // now looking for single campsite comment, not all
        .then(campsite => {
            if (campsite) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite.comments);
            } else {
                err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite) {
                campsite.comments.push(req.body);
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
            } else {
                err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite) {
                for (let i = (campsite.comments.length-1); i >= 0; i--) {
                    campsite.comments.id(campsite.comments[i]._id).remove(); // loops thru to remove every comment by its unique id
                }
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
            } else {
                err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
    });
    
    // handles request of a specific comment for a specific campsite
    campsiteRouter.route('/:campsiteId/comments/:commentId')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite && campsite.comments.id(req.params.commentId)) {
                res.statusCode = 200; // if both truthy
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite.comments.id(req.params.commentId));
            } else if (!campsite) {
                err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            } else {
                err = new Error(`Comment ${req.params.commentId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
    })
    .put((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite && campsite.comments.id(req.params.commentId)) {
                if (req.body.rating) {
                    campsite.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if (req.body.text) {
                    campsite.comments.id(req.params.commentId).text = req.body.text;
                }
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
            } else if (!campsite) {
                err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            } else {
                err = new Error(`Comment ${req.params.commentId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
    })
    .delete((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite && campsite.comments.id(req.params.commentId)) {
                campsite.comments.id(req.params.commentId).remove();
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
            } else if (!campsite) {
                err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            } else {
                err = new Error(`Comment ${req.params.commentId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
    });

module.exports = campsiteRouter;