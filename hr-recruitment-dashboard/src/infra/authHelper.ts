/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { PublicClientApplication } from "@azure/msal-browser";

// Helper function to authenticate the user
export async function authHelper(): Promise<PublicClientApplication> {
	// Get the client id (app id) from the environment variables
	const clientId = process.env.OwningAppId;

	if (!clientId) {
		throw new Error("OwningAppId is not defined");
	}

	const tenantId = process.env.OwningTenantId;
	if (!tenantId) {
		throw new Error("OwningTenantId is not defined");
	}

	// Create the MSAL instance
	const msalConfig = {
		auth: {
			clientId,
			authority: `https://login.microsoftonline.com/${tenantId}/`,
			tenantId,
		},
	};

	// Initialize the MSAL instance
	const msalInstance = new PublicClientApplication(msalConfig);
	await msalInstance.initialize();

	return msalInstance;
}
