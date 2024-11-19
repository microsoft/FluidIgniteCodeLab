/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Candidate, Interviewer, InterviewerPool, OnSiteSchedule } from "@lab/appSchema.js";
import { Button, Tooltip } from "@fluentui/react-components";
import React, { useState } from "react";
import { AvailabilityView } from "./availabilityView.js";
import { DismissFilled, InfoRegular, ListFilled } from "@fluentui/react-icons";
import { DAYS_OF_WEEK } from "../utils/util.js";
import { useTree } from "../utils/treeReactHooks.js";

// This component is responsible for displaying the on-site plan view for the given candidate
export function OnSitePlanView(props: {
	candidate: Candidate; // The candidate for which the on-site plan is being displayed
	onSiteSchedule: OnSiteSchedule; // The on-site schedule for the candidate
	interviewerPool: InterviewerPool; // The pool of interviewers available for the on-site
	handleToggleInterviewerList: () => void; // Function to toggle the interviewer list
}): JSX.Element {
	//############################ START MODULE 0 changes here ##############################
	// const [onSiteSchedule, setOnSiteSchedule] = useState(props.onSiteSchedule);
	// const getOnSiteSchedule = () => {
	// 	return onSiteSchedule;
	// };
	// // Function to remove the interview from the on-site interview
	// const removeInterviewer = (interviewerId: string) => {
	// 	onSiteSchedule.removeInterviewer(interviewerId);
	// 	setOnSiteSchedule({ ...onSiteSchedule });
	// };
	// // Function to set the day of the on-site interview
	// const setOnSiteDay = (day: string) => {
	// 	onSiteSchedule.day = day;
	// 	setOnSiteSchedule({ ...onSiteSchedule });
	// };
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	useTree(props.onSiteSchedule);
	useTree(props.candidate);
	useTree(props.interviewerPool);
	const getOnSiteSchedule = () => {
		return props.onSiteSchedule;
	};
	// Function to remove the interview from the on-site interview
	const removeInterviewer = (interviewerId: string) => {
		props.onSiteSchedule.removeInterviewer(interviewerId);
	};
	// Function to set the day of the on-site interview
	const setOnSiteDay = (day: string) => {
		props.onSiteSchedule.day = day;
	};
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	// The list of interviewers for the on-site interview
	const onSiteInterviewers = getOnSiteSchedule()
		.interviewerIds.map((intId) =>
			props.interviewerPool.find((interviewer) => interviewer.interviewerId === intId),
		)
		.filter((interviewer): interviewer is Interviewer => interviewer !== undefined);

	// Function to check the validity of the on-site interview. The three conditions are:
	// 1. The candidate is available on the day of the on-site
	// 2. The on-site day has 3 interviewers
	// 3. All interviewers are available on the on-site day
	// If any of these conditions are not met, the on-site day is considered invalid
	const isValid = () => {
		if (
			onSiteInterviewers.length !== 3 ||
			!props.candidate.availability.includes(getOnSiteSchedule().day)
		) {
			return false;
		}

		for (const interviewer of onSiteInterviewers) {
			if (!interviewer.availability.includes(getOnSiteSchedule().day)) {
				return false;
			}
		}

		return true;
	};
	const invalidTooltipContent = (
		<>
			A valid on-site day should: <br />
			- Have 3 interviewers <br />
			- Be a day that the candidate is available <br />- Be a day that all interviewers are
			available
		</>
	);

	return (
		<div
			className={`flex flex-col gap-1 content-center w-96 min-w-96 h-full overflow-y-auto border-r-4`}
		>
			<div className="text-lg p-2 mx-0.5 font-bold bg-slate-600 text-white text-center">
				On-Site Day
			</div>
			<div className={`flex flex-col p-2 mx-2 ${isValid() ? "bg-green-100" : "bg-red-100"}`}>
				{isValid() ? (
					<p className="text-center text-green-800 text-xl p-2 font-bold">VALID! </p>
				) : (
					<div className="flex items-center justify-center">
						<p className="text-center text-red-800 text-xl p-2 font-bold">INVALID! </p>
						<Tooltip content={invalidTooltipContent} relationship="label" {...props}>
							<Button
								aria-label="On-site nvalid tooltip"
								appearance="subtle"
								icon={<InfoRegular />}
							/>
						</Tooltip>
					</div>
				)}
				<div className="flex items-center space-x-2 mx-2">
					<select
						aria-label="Select On Site Day"
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2"
						value={getOnSiteSchedule().day}
						onChange={(event) => setOnSiteDay(event.target.value)}
					>
						{DAYS_OF_WEEK.map((day) => (
							<option key={day} value={day}>
								{day}
							</option>
						))}
					</select>
					<Button
						aria-label="Toggle Interviewer Pool list"
						appearance="subtle"
						icon={<ListFilled />}
						onClick={() => props.handleToggleInterviewerList()}
					/>
				</div>
				<div className="flex flex-col gap-1 content-center">
					{onSiteInterviewers.length > 0 ? (
						onSiteInterviewers.map((interviewer) => (
							<InterviewerReadView
								key={interviewer.interviewerId}
								interviewer={interviewer}
								removeHandler={removeInterviewer}
							/>
						))
					) : (
						<div className="flex justify-center items-center p-4">
							No interviewers added yet
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// This component is responsible for displaying the interviewer in the read-only mode in the InterviewerPool drawer
export function InterviewerReadView(props: {
	interviewer: Interviewer;
	removeHandler: (interviewerId: string) => void;
}): JSX.Element {
	return (
		<div className="relative flex flex-col gap-1 justify-center content-center m-2 border border-gray-300 p-2 rounded">
			<div className="flex items-center justify-between">
				<div>
					<div className="mb-1 text-sm">Interviewer</div>
					<div className="text-lg">{props.interviewer.name}</div>
					<div>{props.interviewer.role}</div>
				</div>
				<div className="ml-4">
					<Button
						aria-label="Remove interviewer"
						appearance="subtle"
						icon={<DismissFilled />}
						onClick={() => props.removeHandler(props.interviewer.interviewerId)}
					/>
				</div>
			</div>
			<AvailabilityView avail={props.interviewer.availability} readOnly={true} />
		</div>
	);
}
