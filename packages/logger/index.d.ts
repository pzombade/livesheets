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
declare module '@cedalo/logger' {
	class Logger {
		debug(...args: any): void;
		info(...args: any): void;
		warn(...args: any): void;
		error(...args: any): void;
	}
	class LoggerFactory {
		static createLogger(name: string, level: string): Logger;
	}
}