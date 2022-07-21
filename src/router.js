import express from 'express'
import * as controller from './controller.js'

const routes = express.Router()

// In the subsequent routes, route parameters (tenant, vocab and ids)
//   *must not* begin with an underscore ('_').
// Fixed service endpoints, by contrast, do start with an underscore
//   ('_preview', '_suggest' etc.)

// A. vocab endpoints: *inside* vocabularies/conceptSchemes
// i. either do reconciliation query (if ?queries parameter given), or return service manifest
routes.route('/:tenant([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/:vocab([a-zA-Z0-9]([a-zA-Z0-9%.:_-]|/(?!_)){0,})').get(controller.vocab)

// ii. do a reconciliation query for concepts or the vocabulary
routes.route('/:tenant([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/:vocab([a-zA-Z0-9]([a-zA-Z0-9%.:_-]|/(?!_)){0,})').post(controller.query)

// iii. do a preview for a concept
routes.route('/:tenant([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/:vocab([a-zA-Z0-9]([a-zA-Z0-9%.:_-]|/(?!_)){0,})/_preview/:id([a-zA-Z0-9][a-zA-Z0-9.:/_-]{0,})').get(controller.preview)

// iv. give a suggestion for a concept
routes.route('/:tenant([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/:vocab([a-zA-Z0-9]([a-zA-Z0-9%.:_-]|/(?!_)){0,})/_suggest/entity').get(controller.suggest)		// query parameters are: "prefix" and "cursor"

// v. other services
routes.route('/:tenant([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/:vocab([a-zA-Z0-9]([a-zA-Z0-9%.:_-]|/(?!_)){0,})/_extend').post(controller.extend)
routes.route('/:tenant([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/:vocab([a-zA-Z0-9]([a-zA-Z0-9%.:_-]|/(?!_)){0,})/_flyout').get(controller.flyout)

// B. tenant's vocabs endpoint: *among* vocabularies
// i. either do reconciliation query (if ?queries parameter given), or return service manifest
routes.route('/:tenant([a-zA-Z0-9][a-zA-Z0-9_-]{0,})').get(controller.vocab)

// ii. do a reconciliation query for vocabularies
routes.route('/:tenant([a-zA-Z0-9][a-zA-Z0-9_-]{0,})').post(controller.query)

// iii. do a preview for a vocabulary
routes.route('/:tenant([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/_preview/:vocab([a-zA-Z0-9]([a-zA-Z0-9%.:_-]|/(?!_)){0,})(/:id([a-zA-Z0-9][a-zA-Z0-9%.:/_-]{0,}))?').get(controller.preview)

// iv. give a suggestion for a vocabuly
routes.route('/:tenant([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/_suggest/vocab').get(controller.suggest)		// query parameters are: "prefix" and "cursor"

// v. other services

// C. root vocabs endpoint: *among* vocabularies (of all tenants)
// i. either do reconciliation query (if ?queries parameter given), or return service manifest
routes.route('/').get(controller.vocab)

// ii. do a reconciliation query for vocabularies
routes.route('/').post(controller.query)

// iii. do a preview for a vocabulary
routes.route('/_preview/:tenant([a-zA-Z0-9][a-zA-Z0-9_-]{0,})/:vocab([a-zA-Z0-9]([a-zA-Z0-9%.:_-]|/(?!_)){0,})(/:id([a-zA-Z0-9][a-zA-Z0-9%.:/_-]{0,}))?').get(controller.preview)

// iv. give a suggestion for a vocabuly
routes.route('/_suggest/vocab').get(controller.suggest)		// query parameters are: "prefix" and "cursor"

// v. other services

export { routes }
