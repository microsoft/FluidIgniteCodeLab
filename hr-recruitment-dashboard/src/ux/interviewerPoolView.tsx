/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	DrawerBody,
	DrawerHeader,
	DrawerHeaderTitle,
	InlineDrawer,
	Button,
	useRestoreFocusSource,
} from "@fluentui/react-components";
import { Interviewer, InterviewerPool } from "@lab/appSchema.js";
import React from "react";
import { AddFilled } from "@fluentui/react-icons";
import { AvailabilityView } from "./availabilityView.js";
import { useTreeNode } from "../utils/treeReactHooks.js";

// This component displays the Interviewer Pool and allows the user to add an interviewer to the Onsite Schedule.
export function InterviewerPoolView(props: {
	interviewers: InterviewerPool; // InterviewerPool is an array of Interviewer objects available for adding to the On-site
	isOpen: boolean; // Boolean to indicate if the drawer is open
	setIsOpen: (isOpen: boolean) => void; // Function to set the state of the drawer
	handleAddInterviewer: (interviewerId: string) => void; // Function to add an interviewer to the On-site
}): JSX.Element {
	const restoreFocusSourceAttributes = useRestoreFocusSource();

	return (
		<InlineDrawer
			{...restoreFocusSourceAttributes}
			separator
			open={props.isOpen}
			position="end"
			className="min-w-80"
		>
			<DrawerHeader>
				<DrawerHeaderTitle>
					<div className="text-lg p-2">Interviewer Pool</div>
				</DrawerHeaderTitle>
			</DrawerHeader>

			<DrawerBody>
				{props.interviewers.map((interviewer, index) => (
					<InterviewerView
						key={index}
						interviewer={interviewer}
						handleAddInterviewer={props.handleAddInterviewer}
					/>
				))}
			</DrawerBody>
		</InlineDrawer>
	);
}

// This component displays the details of an Interviewer and allows the user to add the Interviewer to the Onsite Schedule.
export function InterviewerView(props: {
	interviewer: Interviewer; // Interviewer object to be displayed
	handleAddInterviewer: (interviewerId: string) => void; // Function to add an interviewer to the On-site
}): JSX.Element {
	//############################ START MODULE 1 changes here ##############################
	useTreeNode(props.interviewer);
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	return (
		<div className="flex flex-col gap-1 content-center my-2 min-w-64 border border-gray-300 p-2 rounded">
			<div className="flex flex-row gap-1 items-center">
				<Button
					aria-label="Add interviewer to Onsite Schedule"
					appearance="subtle"
					icon={<AddFilled />}
					onClick={() => props.handleAddInterviewer(props.interviewer.interviewerId)} // Add the Interviewer to the Onsite Schedule
				/>
				<div className="flex-grow">
					<div className="mb-1">
						<label className="block mb-1 text-sm font-medium text-gray-900">
							Name:
						<input
							className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
							value={props.interviewer.name}
							onChange={(event) => (props.interviewer.name = event.target.value)}
						/>
						</label>
					</div>
					<div className="mb-1">
						<label className="block mb-1 text-sm font-medium text-gray-900">
							Role:
						<input
							className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
							value={props.interviewer.role}
							onChange={(event) => (props.interviewer.role = event.target.value)}
						/>
						</label>
					</div>
				</div>
			</div>
			<AvailabilityView avail={props.interviewer.availability} />
		</div>
	);
}
