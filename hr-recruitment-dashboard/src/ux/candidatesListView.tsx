/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { useContext, useEffect, useState } from "react";
import { Candidate, Job } from "@lab/appSchema.js";
import { createTestCandidate } from "../utils/testData.js";
import React from "react";
import { AvailabilityView } from "./availabilityView.js";
import { getKeysByValue } from "../utils/util.js";
import { userAvatarGroupView } from "./userAvatarGroupView.js";
import { ISessionClient } from "@fluidframework/presence/alpha";
import { UserInfo } from "../utils/presenceManager.js";
import { useTreeNode } from "../utils/treeReactHooks.js";
import { PresenceContext } from "../index.js";

// This component displays the list of candidates for the given job
export function CandidatesListView(props: {
	job: Job; // The Job this candidate list belongs to
	selectedCandidate: Candidate | undefined; // Currently Selected Candidate
	setSelectedCandidate: (candidate: Candidate | undefined) => void; // Function to set the selected candidate
}): JSX.Element {
	//############################ START MODULE 0 changes here ##############################
	// const [job, setJob] = useState(props.job);
	// if (job.jobId !== props.job.jobId) {
	// 	setJob(props.job);
	// }
	// const getJob = () => {
	// 	return job;
	// };
	// const addCandidate = (candidate: Candidate) => {
	// 	const newJob = { ...job };
	// 	newJob.candidates.push(candidate);
	// 	setJob(newJob);
	// };
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	useTreeNode(props.job.candidates);
	useTreeNode(props.job.onSiteSchedule);
	const getJob = () => {
		return props.job;
	};

	// Function to add a new candidate to the job
	const addCandidate = (candidate: Candidate) => {
		props.job.addCandidate(candidate);
	};
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	// {VIEW MOD_2}
	// Get the PresenceManager context, if available
	const presenceManager = useContext(PresenceContext);
	let candidatePresenceUserInfoList: UserInfo[][] = [];

	if (presenceManager) {
		// Initialize the candidate selection map by remote clients if PresenceManager context is present
		const [candidatePresenceMap, setCandidatePresenceMap] = useState<
			Map<ISessionClient, string>
		>(
			new Map(
				// Get candidate selection from the PresenceState object
				[...presenceManager.getStates().candidateSelection.clientValues()].map(
					(cv) => [cv.client, cv.value.candidateSelected] as [ISessionClient, string],
				),
			),
		);
		useEffect(() => {
			// Listen to the "updated" event for changes to candiate selection by remote clients
			return presenceManager.getStates().candidateSelection.events.on("updated", (update) => {
				const remoteSessionClient = update.client; // The client that updated the state
				const remoteSelectedCandidateId = update.value.candidateSelected; // The candidate selected by the remote client

				// if empty string, then no candidate is selected, remove it from the map
				if (remoteSelectedCandidateId === "") {
					// Remove the candidate selection if the remote client unselected the candidate
					candidatePresenceMap.delete(remoteSessionClient);
					setCandidatePresenceMap(new Map(candidatePresenceMap));
				} else {
					// Set the new candidate seletion value for the remove client in our local map
					setCandidatePresenceMap(
						new Map(
							candidatePresenceMap.set(
								remoteSessionClient,
								remoteSelectedCandidateId,
							),
						),
					);
				}
			});
		}, []);
		// Get the UserInfo for each candidate selected by remote clients
		candidatePresenceUserInfoList = getJob().candidates.map((candidate) => {
			return presenceManager.getUserInfo(
				getKeysByValue(candidatePresenceMap, candidate.candidateId),
			);
		});
	}
	// {END MOD_2}

	// Function to set the selected candidate
	const setSelectedCandidate = (candidate: Candidate | undefined) => {
		props.setSelectedCandidate(candidate);

		// {VIEW MOD_2}
		if (presenceManager) {
			// Set the candidate selection state for the local client, if presence Manager is available
			presenceManager.getStates().candidateSelection.local = {
				candidateSelected: candidate ? candidate.candidateId : "",
			};
		}
		// {END MOD_2}
	};

	return (
		<div className="flex flex-col gap-1 content-center w-96 min-w-96 h-full border-r-4 overflow-auto">
			<div className="text-lg p-2 mx-0.5 font-bold bg-violet-600 text-white text-center">
				Candidates
			</div>
			<div className="flex-grow mx-2">
				{getJob().candidates.length === 0 ? (
					<div className="my-8 text-center">😞 No candidates yet!</div>
				) : (
					getJob().candidates.map((candidate, index) => (
						<CandidateView
							key={index}
							candidate={candidate}
							// {VIEW MOD_2}
							presenceUserInfoList={candidatePresenceUserInfoList[index]}
							// {END MOD_2}
							job={getJob()}
							isSelected={props.selectedCandidate === candidate}
							setSelectedCandidate={setSelectedCandidate}
						/>
					))
				)}
			</div>
			<div className="flex mx-2 mb-2 justify-center">
				<button
					aria-label="Add New Candidate"
					className="bg-blue-600 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded w-1/2"
					onClick={() => {
						addCandidate(createTestCandidate());
					}}
				>
					+ Add New Candidate
				</button>
			</div>
		</div>
	);
}

// This component displays the details of a candidate
export function CandidateView(props: {
	candidate: Candidate;
	job: Job;
	isSelected: boolean; // Flag to indicate if the candidate is selected
	setSelectedCandidate: (candidate: Candidate | undefined) => void; // Function to set the selected candidate
	presenceUserInfoList?: UserInfo[]; // List of UserInfo for remote clients that have this candidate selected
}): JSX.Element {
	//############################ START MODULE 0 changes here ##############################
	// const [candidate, setCandidate] = useState(props.candidate);
	// const getCandidate = () => {
	// 	return candidate;
	// };
	// const setCandidateName = (name: string) => {
	// 	setCandidate({ ...candidate, name });
	// };
	// const setCandidateYearsOfExperience = (yearsOfExperience: string) => {
	// 	const experience = yearsOfExperience === "" ? 0 : Number(yearsOfExperience);
	// 	setCandidate({ ...candidate, yearsOfExperience: experience });
	// };
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	useTreeNode(props.candidate);
	const getCandidate = () => {
		return props.candidate;
	};
	const setCandidateName = (name: string) => {
		props.candidate.name = name;
	};
	const setCandidateYearsOfExperience = (yearsOfExperience: string) => {
		props.candidate.yearsOfExperience =
			yearsOfExperience === "" ? 0 : Number(yearsOfExperience);
	};
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	return (
		<div
			className={`flex flex-col gap-1 justify-center content-center m-1 p-2 cursor-pointer
                ${props.isSelected ? "bg-violet-50 border border-violet-300" : "bg-slate-50 hover:bg-slate-100"}
				${
					getCandidate().isUnread ||
					props.job.getOnSiteForCandidate(getCandidate().candidateId)?.isUnread
						? "border-4 border-double border-red-600"
						: ""
				}
           `}
			onClick={() => {
				props.setSelectedCandidate(getCandidate());
			}}
		>
			<div className="flex justify-end gap-2">
				{(getCandidate().isUnread ||
					props.job.getOnSiteForCandidate(getCandidate().candidateId)?.isUnread) && (
					<div className="flex items-center p-2">
						<span className="w-2 h-2 bg-red-500 rounded-full"></span>
					</div>
				)}
				{!props.job.hasOnSiteForCandidate(getCandidate().candidateId) ? (
					<button
						aria-label="Setup On-Site"
						className="bg-blue-600 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded w-fit"
						onClick={() =>
							props.job.addNewOnSiteForCandidate(getCandidate().candidateId)
						}
					>
						Setup On-Site
					</button>
				) : (
					// shows text saying that onsite has been setup
					<div className="text-green-600 font-bold p-2 rounded">On-Site Scheduled ✅</div>
				)}
			</div>
			{
				// {VIEW MOD_2}
				userAvatarGroupView({
					members: props.presenceUserInfoList,
					size: 24,
					layout: "stack",
				})
				// {END MOD_2}
			}

			<div className="mb-3">
				<label className="block mb-1 text-sm font-medium text-gray-900">
					Name:
					<input
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						value={getCandidate().name}
						onChange={(event) => setCandidateName(event.target.value)}
					/>
				</label>
			</div>
			<div className="mb-3">
				<label className="block mb-1 text-sm font-medium text-gray-900">
					Years of Experience:
					<input
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						value={getCandidate().yearsOfExperience}
						onChange={(event) => setCandidateYearsOfExperience(event.target.value)}
					/>
				</label>
			</div>
			<AvailabilityView avail={getCandidate().availability} />
		</div>
	);
}
