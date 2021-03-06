/********************************************************************************
 * Copyright (c) 2020 Cedalo AG
 *
 * This program and the accompanying materials are made available under the 
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 ********************************************************************************/
const config = require('./config/start.json');
const EventEmittingRESTServer = require('./src/server/EventEmittingRESTServer');

config.basedir = __dirname;

const server = new EventEmittingRESTServer(config);
server.start();

