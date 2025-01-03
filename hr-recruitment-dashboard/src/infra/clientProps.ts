/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { ITelemetryBaseLogger } from "@fluidframework/core-interfaces";
import { IOdspTokenProvider, OdspClientProps } from "@fluidframework/odsp-client/beta";

// Create the client props for the Fluid client
export const getClientProps = (
	siteUrl: string,
	driveId: string,
	tokenProvider: IOdspTokenProvider,
	logger?: ITelemetryBaseLogger,
): OdspClientProps => {
	const connectionConfig = {
		tokenProvider: tokenProvider,
		siteUrl: siteUrl,
		driveId: driveId,
		filePath: "",
	};

	return {
		connection: connectionConfig,
		logger,
	};
};
