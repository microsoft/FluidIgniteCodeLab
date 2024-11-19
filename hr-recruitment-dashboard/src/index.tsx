/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { createContext } from "react";
import { createRoot, Root } from "react-dom/client";
import { containerSchema } from "./infra/fluid.js";
import { treeConfiguration } from "@lab/appSchema.js";
import { createTestAppData } from "./utils/testData.js";
import "./output.css";
import { AttachState, IFluidContainer } from "fluid-framework";
import { HRApp } from "./hrApp.js";
import { createUndoRedoStacks, undoRedo } from "./utils/undo.js";
import { acquirePresenceViaDataObject } from "@fluidframework/presence/alpha";
import { PresenceManager } from "./utils/presenceManager.js";
import {
	TinyliciousClient,
	TinyliciousContainerServices,
} from "@fluidframework/tinylicious-client";
import { speStart } from "./infra/speStart.js";

// Create contexts for PresenceManager and undoRedo, these will be shared with underlying components
export const PresenceContext = createContext<PresenceManager | undefined>(undefined);
export const UndoRedoContext = createContext<undoRedo | undefined>(undefined);

// Using the TinyliciousClient to start the app and rendering the HRApp component locally
async function tinyliciousStart() {
	// Create the root element for React
	const app = document.createElement("div");
	app.id = "app";
	document.documentElement.lang = "en";
	document.body.appendChild(app);
	const root = createRoot(app);

	//############################ START MODULE 0 changes here ##############################
	// Render the HRApp component with test data
	// root.render(<HRApp data={createTestAppData()} />);
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	// Render the Fluid view using the local Tinylicious server
	renderFluidViewWithTinylicious(root);
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////
}

// Render the Fluid view using the TinyliciousClient
async function renderFluidViewWithTinylicious(root: Root) {
	// Create a new TinyliciousClient
	const tinyliciousClient = new TinyliciousClient();

	// Get the container ID from the URL parameters (if available)
	let containerId = new URLSearchParams(window.location.search).get("fluidContainerId") || "";

	let container: IFluidContainer<typeof containerSchema>;
	let services: TinyliciousContainerServices;

	if (containerId === "") {
		// containerId not found, need to create a new container
		({ container, services } = await tinyliciousClient.createContainer(containerSchema, "2"));
	} else {
		// containerId found, need to load the container
		({ container, services } = await tinyliciousClient.getContainer(
			containerId, // ID of the container to load
			containerSchema, // Container schema used to process the container
			"2", // Compatibility mode flag for the container. "2" means use the container in FF 2.x mode
		));
	}

	let appView = <div></div>;

	//############################ START MODULE 1 changes here ##############################
	// Initialize the SharedTree Data Structure
	const appData = container.initialObjects.appData.viewWith(treeConfiguration);
	if (appData.compatibility.canInitialize) {
		appData.initialize(createTestAppData());
	}
	// Create undo/redo stacks for the app
	const undoRedoContext = createUndoRedoStacks(appData.events);

	// Render the HRApp component with Fluid data and provide the Undo/Redo context for Module 1
	appView = (
		<UndoRedoContext.Provider value={undoRedoContext}>
			<HRApp data={appData} />
		</UndoRedoContext.Provider>
	);
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	//############################ START MODULE 2 changes here ##############################
	// Get the Presence data object from the container
	const appPresence = acquirePresenceViaDataObject(container.initialObjects.presence);
	// Create a PresenceManager context to manage the presence of users
	const presenceManagerContext: PresenceManager = new PresenceManager(
		appPresence,
		services.audience,
	);
	// Render the HRApp component with Fluid data and provide the PresenceManager context for Module 2
	appView = (
		<PresenceContext.Provider value={presenceManagerContext}>
			<UndoRedoContext.Provider value={undoRedoContext}>
				<HRApp data={appData} />
			</UndoRedoContext.Provider>
		</PresenceContext.Provider>
	);
	//////////////////////////////// END MODULE 2 changes here //////////////////////////////

	root.render(appView);

	// Once the container is attached, update the URL with the container ID so it can be easily shared with others
	if (container.attachState === AttachState.Detached) {
		containerId = await container.attach();

		const url = new URL(window.location.href);
		const searchParams = url.searchParams;
		searchParams.set("fluidContainerId", containerId);
		const newUrl = `${url.pathname}?${searchParams.toString()}`;
		window.history.replaceState({}, "", newUrl);
	}
}

const targetServer = process.env.FLUID_CLIENT;

// Start the app based on the target server
if (targetServer === "tinylicious") {
	tinyliciousStart().catch((error) => console.error(error));
} else if (targetServer === "spe") {
	speStart().catch((error) => console.error(error));
}
