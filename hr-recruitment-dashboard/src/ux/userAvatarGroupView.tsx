/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	AvatarGroup,
	AvatarGroupItem,
	AvatarGroupPopover,
	AvatarSize,
	Tooltip,
	partitionAvatarGroupItems,
} from "@fluentui/react-components";
import React from "react";
import { UserInfo } from "../utils/presenceManager.js";

// Component used to show prensence of users in the app, and in specific parts of the app including
// jobs and candidate cards.
export function userAvatarGroupView(props: {
	members?: UserInfo[]; // Optional array of UserInfo objects representing the members
	myselfUserId?: string; // Optional string representing the current user's ID
	size: AvatarSize; // Size of the avatars
	layout: "spread" | "stack"; // Layout style for the avatar group
}): JSX.Element {
	if (!props.members) {
		// If no members are provided, return an empty view
		return <></>;
	}

	// Partition the members into inline and overflow items
	const { inlineItems, overflowItems } = partitionAvatarGroupItems({
		items: props.members,
	});

	// Function to get the display name of a member, including their email if available
	const getToolTipName = (member: UserInfo) => {
		const emailPart = member.userEmail ? ` - ${member.userEmail}` : "";
		return `${member.userName}${emailPart}`;
	};

	return (
		// Render the AvatarGroup component with the specified size and layout
		<AvatarGroup size={props.size} layout={props.layout} className="pr-2">
			{/* Render inline avatar items with tooltips */}
			{inlineItems.map((member) => (
				<Tooltip
					content={getToolTipName(member)}
					key={member.userId + Math.random()}
					relationship="description"
				>
					<AvatarGroupItem
						active={props.myselfUserId === member.userId ? "active" : "unset"}
						color="colorful"
						name={member.userName}
						key={member.userId + Math.random()}
					/>
				</Tooltip>
			))}
			{/* Render overflow avatar items in a popover if there are any */}
			{overflowItems && (
				<AvatarGroupPopover>
					{overflowItems.map((member) => (
						<AvatarGroupItem
							name={getToolTipName(member)}
							key={member.userId + Math.random()}
							color="colorful"
						/>
					))}
				</AvatarGroupPopover>
			)}
		</AvatarGroup>
	);
}
