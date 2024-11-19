/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	ClientSessionId,
	IPresence,
	ISessionClient,
	Latest,
	PresenceStates,
} from "@fluidframework/presence/alpha";
import { OdspMember, type IOdspAudience } from "@fluidframework/odsp-client/beta";
import { TinyliciousMember, type ITinyliciousAudience } from "@fluidframework/tinylicious-client";
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

// Type guard to check if a member is an OdspMember
function isOdspMember(member: OdspMember | TinyliciousMember): member is OdspMember {
	return "email" in member;
}

export class PresenceManager {
	// A PresenceState object to manage the presence of users within the app
	private readonly appSelectionPresenceState: PresenceStates<typeof appSelectionSchema>;
	// A map of SessionClient to UserInfo, where users can share their info with other users
	private readonly userInfoMap: Map<ISessionClient, UserInfo> = new Map();
	// A callback methid to get updates when remote UserInfo changes
	private userInfoCallback: (userInfoMap: Map<ISessionClient, UserInfo>) => void = () => { };

	constructor(
		private readonly presence: IPresence,
		private readonly audience: IOdspAudience | ITinyliciousAudience,
	) {
		this.presence = presence;
		this.audience = audience;

		// Address for the presence state, this is used to organize the presence states and avoid conflicts
		const appSelectionWorkspaceAddress = "appSelection:workspace";

		// Initialize presence state for the app selection workspace
		this.appSelectionPresenceState = presence.getStates(
			appSelectionWorkspaceAddress, // Workspace address
			appSelectionSchema, // Workspace schema
		);

		// Listen for updates to the userInfo property in the presence state
		this.appSelectionPresenceState.props.userInfo.events.on("updated", (update) => {
			// The remote client that updated the userInfo property
			const remoteSessionClient = update.client;
			// The new value of the userInfo property
			const remoteUserInfo = update.value;

			// Update the userInfoMap with the new value
			this.userInfoMap.set(remoteSessionClient, remoteUserInfo);
			// Notify the app about the updated userInfoMap
			this.userInfoCallback(this.userInfoMap);
		});

		// Set the local user's info
		this.setMyUserInfo();
		this.audience.on("membersChanged", () => {
			this.setMyUserInfo();
		});
	}

	// Set the local user's info and set it on the Presence State to share with other clients
	private setMyUserInfo() {
		const myselfMember = this.audience.getMyself();

		if (myselfMember) {
			const myRandomName = uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: ' ', style: 'capital' });

			this.appSelectionPresenceState.props.userInfo.local = {
				userId: myselfMember.id,
				userName: isOdspMember(myselfMember) ? myselfMember.name : myRandomName,
				userEmail: isOdspMember(myselfMember) ? myselfMember.email : myRandomName.replace(/ /g, "_") + "@hotmail.com",
			};

			this.userInfoMap.set(
				this.presence.getMyself(),
				this.appSelectionPresenceState.props.userInfo.local,
			);
			this.userInfoCallback(this.userInfoMap);
		}
	}

	// Returns the presence state of the app selection workspace
	getStates() {
		return this.appSelectionPresenceState.props;
	}

	// Returns the presence object
	getPresence() {
		return this.presence;
	}

	// Allows the app to listen for updates to the userInfoMap
	setUserInfoUpdateListener(callback: (userInfoMap: Map<ISessionClient, UserInfo>) => void) {
		this.userInfoCallback = callback;
	}

	// Returns the UserInfo of given session clients
	getUserInfo(sessionList: ISessionClient<ClientSessionId>[]) {
		const userInfoList: UserInfo[] = [];

		for (const sessionClient of sessionList) {
			// If local user or remote user is connected, then only add it to the list
			try {
				const userInfo =
					this.appSelectionPresenceState.props.userInfo.clientValue(sessionClient).value;
				if (userInfo) {
					// If the user is local user, then add it to the beginning of the list
					if (sessionClient.sessionId === this.presence.getMyself().sessionId) {
						userInfoList.unshift(userInfo);
					} else {
						// If the user is remote user, then add it to the end of the list
						userInfoList.push(userInfo);
					}
				}
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (e) {
				// Do nothing
			}
		}

		return userInfoList;
	}
}

// Schema for the Presence Manager
export const appSelectionSchema = {
	// Holds a list of jobs selected by remote users
	jobSelection: Latest({ jobSelected: "" }),
	// Holds the candidate selected by remote users
	candidateSelection: Latest({ candidateSelected: "" }),
	// Holds the user info of remote users
	userInfo: Latest({ userId: "", userName: "", userEmail: "" } satisfies UserInfo),
};

export type UserInfo = { userId: string; userName: string; userEmail: string };
