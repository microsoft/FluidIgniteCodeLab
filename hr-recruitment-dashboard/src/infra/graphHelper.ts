/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { PublicClientApplication, InteractionType, AccountInfo } from "@azure/msal-browser";
import { Client } from "@microsoft/microsoft-graph-client";
import {
	AuthCodeMSALBrowserAuthenticationProvider,
	AuthCodeMSALBrowserAuthenticationProviderOptions,
} from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser";
import { Site } from "@microsoft/microsoft-graph-types";

export interface FileStorageContainer {
	containerTypeId: string;
	createdDateTime: string;
	displayName: string;
	id: string;
}

// Helper class to interact with the Microsoft Graph API
// This allows us to interact with the Graph API to get the file storage container ID,
// the Fluid container ID, and the site URL. As well as create a sharing link and get the shared item.
export class GraphHelper {
	private readonly intializedPublicClientApplication: PublicClientApplication;
	private readonly accountInfo: AccountInfo;
	private readonly graphClient: Client;
	constructor(publicClientApplication: PublicClientApplication, accountInfo: AccountInfo) {
		this.intializedPublicClientApplication = publicClientApplication;
		this.accountInfo = accountInfo;

		// Create the auth provider including the required scopes for the app
		const options: AuthCodeMSALBrowserAuthenticationProviderOptions = {
			account: this.accountInfo, // the AccountInfo instance to acquire the token for.
			interactionType: InteractionType.Redirect, // msal-browser InteractionType
			scopes: ["FileStorageContainer.Selected", "Files.ReadWrite"], // scopes to be passed
		};

		const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
			this.intializedPublicClientApplication,
			options,
		);

		// Initialize the Graph client
		this.graphClient = Client.initWithMiddleware({
			authProvider,
		});
	}

	// Function to get the file storage container ID
	public async getFileStorageContainerId(): Promise<string> {
		// Get the container type id from the environment variables
		const containerTypeId = process.env.ContainerTypeId;

		if (!containerTypeId) {
			throw new Error("ContainerTypeId is not defined");
		}

		// Fetch the file storage container ID using the Graph API
		try {
			const response = await this.graphClient
				.api("/storage/fileStorage/containers")
				.filter("containerTypeId eq " + containerTypeId)
				.version("beta")
				.get();

			console.log("getFileStorageContainerId response: ", response.value);
			const fileStorageContainers: FileStorageContainer[] = response.value;

			if (fileStorageContainers.length == 0) {
				return await this.createFileStorageContainer();
			}

			return fileStorageContainers[0].id;
		} catch (error) {
			console.error("Error while fetching file storage container ID: ", error);
			return await this.createFileStorageContainer();
		}
	}

	public async createFileStorageContainer(): Promise<string> {
		// Get the container type id from the environment variables
		const containerTypeId = process.env.ContainerTypeId;

		if (!containerTypeId) {
			throw new Error("ContainerTypeId is not defined");
		}

		try {
			const response = await this.graphClient
				.api("/storage/fileStorage/containers")
				.version("beta")
				.post({
					containerTypeId: containerTypeId,
					displayName: "Fluid Container",
					description: "Fluid Container Description",
				});

			const fileStorageContainers: FileStorageContainer[] = response.value;
			if (fileStorageContainers.length == 0) {
				throw new Error("No file storage containers found");
			}
			return fileStorageContainers[0].id;
		} catch (error) {
			console.error("Error while fetching file storage container ID: ", error);
			throw error;
		}
	}

	// Function to get the site URL
	public async getSiteUrl(): Promise<string> {
		const response = await this.graphClient
			.api("/sites")
			.version("beta")
			.filter("siteCollection/root ne null")
			.select("siteCollection,webUrl")
			.get();

		const sites: Site[] = response.value;

		return sites[0].webUrl as string;
	}

	// Function to create a sharing link which will be used to get the shared item
	public async createSharingLink(driveId: string, id: string, permType: string): Promise<string> {
		const permission = {
			type: permType,
			scope: "organization",
		};
		const response = await this.graphClient
			.api(`/drives/${driveId}/items/${id}/createLink`)
			.post(permission);

		console.log("createSharingLink response: ", response.link);

		return response.shareId as string;
	}

	// Function to get the shared item using the sharing link
	public async getSharedItem(shareId: string): Promise<{ itemId: string; driveId: string }> {
		const response = await this.graphClient
			.api(`/shares/${shareId}/driveItem`)
			.header("Prefer", "redeemSharingLink")
			.get();

		return {
			itemId: response.id as string,
			driveId: response.parentReference.driveId as string,
		};
	}
}
