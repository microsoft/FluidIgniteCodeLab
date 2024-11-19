/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useContext, useEffect, useState } from "react";
import { TreeView } from "fluid-framework";
import { Candidate, HRData, Job, type OnSiteSchedule } from "@lab/appSchema.js";
import { userAvatarGroupView } from "./ux/userAvatarGroupView.js";
import { InterviewerPoolView } from "./ux/interviewerPoolView.js";
import { OnSitePlanView } from "./ux/onSitePlanView.js";
import { CandidatesListView } from "./ux/candidatesListView.js";
import { JobsListView } from "./ux/jobsListView.js";
import { AiChatView } from "./mod3/aiChatView.js";
import { Button, FluentProvider, webLightTheme } from "@fluentui/react-components";
import { undoRedo } from "./utils/undo.js";
import { ArrowRedoFilled, ArrowUndoFilled } from "@fluentui/react-icons";
import { UndoRedoContext, PresenceContext } from "./index.js";

//############################ START MODULE 0 changes here ##############################
// export function HRApp(props: { data: HRData }): JSX.Element {
// 	const appData = props.data;
//////////////////////////////// END MODULE 0 changes here //////////////////////////////

//############################ START MODULE 1 changes here ##############################
export function HRApp(props: { data: TreeView<typeof HRData> }): JSX.Element {
	const appData = props.data.root;
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	const [selectedJob, setSelectedJob] = useState<Job>();
	const [selectedCandidate, setSelectedCandidate] = useState<Candidate>();
	const [onSiteForSelectedCandidate, setOnSiteForSelectedCandidate] = useState<OnSiteSchedule>();
	const [openDrawer, setOpenDrawer] = useState(false);

	// Function to handle job selection
	const handleJobSelected = (job: Job | undefined) => {
		setSelectedJob(job);
		setSelectedCandidate(undefined);
		setOnSiteForSelectedCandidate(undefined);
		setOpenDrawer(false);

		if (job?.isUnread) {
			job.isUnread = false;
		}
	};

	// Function to handle candidate selection
	const handleCandidateSelected = (candidate: Candidate | undefined) => {
		setSelectedCandidate(candidate);
		if (candidate) {
			if (selectedJob?.hasOnSiteForCandidate(candidate.candidateId)) {
				const candidateSchedule = selectedJob.getOnSiteForCandidate(candidate.candidateId);
				if (candidateSchedule) {
					if (candidateSchedule.isUnread) {
						candidateSchedule.isUnread = false;
					}
					setOnSiteForSelectedCandidate(candidateSchedule);
				}
			} else {
				setOnSiteForSelectedCandidate(undefined);
			}
			setOpenDrawer(false);
			if (candidate.isUnread) {
				candidate.isUnread = false;
			}
		}
	};

	// Function to handle adding an interviewer to the currently selected candidate's on-site schedule
	const handleAddInterviewer = (interviewerId: string) => {
		onSiteForSelectedCandidate?.addInterviewer(interviewerId);
	};

	// Animated frame for displaying AI processing, used by Module 3
	const [showAnimatedFrame, setShowAnimatedFrame] = useState(false);

	// List of the views for the header, we will progressively add more views through the modules
	const headerViews = [];
	// Add the title view to the header
	headerViews.push(
		<h1 key="header_title" className="text-xl font-bold text-white flex-auto w-24">
			HR Recruitment Dashboard
		</h1>,
	);

	//############################ START MODULE 3 changes here ##############################
	// Add the AI chat view to the header
	headerViews.push(
		<AiChatView
			key="ai_chat_view"
			treeRoot={props.data}
			showAnimatedFrame={(show: boolean) => {
				setShowAnimatedFrame(show);
			}}
		/>,
	);
	//////////////////////////////// END MODULE 3 changes here //////////////////////////////

	// Add the undo redo buttons to the header if the Undo/Redo context is available
	const undoRedo = useContext(UndoRedoContext);
	if (undoRedo) {
		// Unsubscribe to undo-redo events when the component unmounts
		useEffect(() => {
			return undoRedo ? undoRedo.dispose : undefined;
		}, []);

		headerViews.push(<ActionToolBar key="undo_redo_actions" undoRedo={undoRedo} />);
	}

	// {VIEW MOD_2}
	// Add the presence group view to the header
	headerViews.push(<AppPresenceGroup key="presence_view" />);
	// {END MOD_2}

	return (
		<div
			className={`h-screen frame
			${showAnimatedFrame ? "animated-frame" : ""}`}
		>
			<div className="inner">
				<FluentProvider theme={webLightTheme}>
					<div className="flex flex-col h-fit w-full overflow-y-hidden overscroll-y-none gap-1">
						<div className="flex flex-row w-full bg-gray-800 p-4 gap-8 items-center">
							{headerViews}
						</div>
						<div className="flex flex-row flex-nowrap w-full overflow-x-auto h-[calc(100vh-90px)]">
							<JobsListView
								jobs={appData.jobsList}
								setSelectedJob={handleJobSelected}
								selectedJob={selectedJob}
							/>
							{selectedJob && (
								<CandidatesListView
									job={selectedJob}
									selectedCandidate={selectedCandidate}
									setSelectedCandidate={handleCandidateSelected}
								/>
							)}
							{selectedCandidate && onSiteForSelectedCandidate && (
								<OnSitePlanView
									candidate={selectedCandidate}
									onSiteSchedule={onSiteForSelectedCandidate!}
									interviewerPool={appData.interviewerPool}
									handleToggleInterviewerList={() => setOpenDrawer(!openDrawer)}
								/>
							)}
							{onSiteForSelectedCandidate && (
								<InterviewerPoolView
									interviewers={appData.interviewerPool}
									isOpen={openDrawer}
									setIsOpen={setOpenDrawer}
									handleAddInterviewer={handleAddInterviewer}
								/>
							)}
						</div>
					</div>
				</FluentProvider>
			</div>
		</div>
	);
}

// Action tool bar container undo redo buttons
export function ActionToolBar(props: { undoRedo: undoRedo }): JSX.Element {
	return (
		<div className="flex flex-row flex-none gap-4">
			<Button
				aria-label="Undo"
				appearance="subtle"
				icon={<ArrowUndoFilled className="text-white" />}
				onClick={() => props.undoRedo.undo()}
			/>
			<Button
				aria-label="Redo"
				appearance="subtle"
				icon={<ArrowRedoFilled className="text-white" />}
				onClick={() => props.undoRedo.redo()}
			/>
		</div>
	);
}

// Component to display the presence group
export function AppPresenceGroup(): JSX.Element {
	const presenceManager = useContext(PresenceContext);
	if (presenceManager === undefined) {
		return <div></div>;
	}

	const [invalidations, setInvalidations] = useState(0);

	useEffect(() => {
		// Listen to the attendeeJoined event and update the presence group when a new attendee joins
		const unsubJoin = presenceManager.getPresence().events.on("attendeeJoined", () => {
			setInvalidations(invalidations + Math.random());
		});
		// Listen to the attendeeDisconnected event and update the presence group when an attendee leaves
		const unsubDisconnect = presenceManager
			.getPresence()
			.events.on("attendeeDisconnected", () => {
				setInvalidations(invalidations + Math.random());
			});
		// Listen to the userInfoUpdate event and update the presence group when the user info is updated
		presenceManager.setUserInfoUpdateListener(() => {
			setInvalidations(invalidations + Math.random());
		});

		return () => {
			unsubJoin();
			unsubDisconnect();
			presenceManager.setUserInfoUpdateListener(() => {});
		};
	}, []);

	// Get the list of connected attendees
	const connectedAttendees = [...presenceManager.getPresence().getAttendees()].filter(
		(attendee) => attendee.getConnectionStatus() === "Connected",
	);

	// Get the user info for the connected attendees
	const userInfoList = presenceManager.getUserInfo(connectedAttendees);

	// Display the presence group with connected attendees
	if (userInfoList) {
		return userAvatarGroupView({
			members: userInfoList,
			myselfUserId: presenceManager.getStates().userInfo.local.userId,
			size: 40,
			layout: "spread",
		});
	} else {
		return <div>error</div>;
	}
}
