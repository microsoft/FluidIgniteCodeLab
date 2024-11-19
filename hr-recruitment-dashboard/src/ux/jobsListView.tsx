/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useContext, useEffect, useState } from "react";
import { Job, JobsArray } from "@lab/appSchema.js";
import { createTestJob } from "../utils/testData.js";
import { Button } from "@fluentui/react-components";
import { DismissFilled } from "@fluentui/react-icons";
import { getKeysByValue } from "../utils/util.js";
import { userAvatarGroupView } from "./userAvatarGroupView.js";
import { ISessionClient } from "@fluidframework/presence/alpha";
import { UserInfo } from "../utils/presenceManager.js";
import { useTreeNode } from "../utils/treeReactHooks.js";
import { PresenceContext } from "../index.js";

// This component displays a list of jobs and allows the user to select a job.
export function JobsListView(props: {
	jobs: JobsArray;
	setSelectedJob: (job: Job | undefined) => void;
	selectedJob?: Job;
}): JSX.Element {
	//############################ START MODULE 0 changes here ##############################
	// const [jobs, setJobs] = useState(props.jobs);
	// const getJobs = () => {
	// 	return jobs;
	// };
	// const deleteJob = (job: Job) => {
	// 	const newJobs = new JobsArray(...jobs);
	// 	newJobs.deleteJob(job);
	// 	setJobs(newJobs);
	// };
	// const addJob = (job: Job) => {
	// 	const newJobs = new JobsArray(...jobs);
	// 	newJobs.addJob(job);
	// 	setJobs(newJobs);
	// };
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	useTreeNode(props.jobs);
	const getJobs = () => {
		return props.jobs;
	};
	const deleteJob = (job: Job) => {
		props.jobs.deleteJob(job);
	};
	const addJob = (job: Job) => {
		props.jobs.addJob(job);
	};
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	// {VIEW MOD_2}
	// Get the PresenceManager context, if available
	const presenceManager = useContext(PresenceContext);
	let jobPresenceUserInfoList: UserInfo[][] = [];
	if (presenceManager) {
		// Initialize the job selection map by remote clients if PresenceManager context is present
		const [jobPresenceMap, setJobPresenceMap] = useState<Map<ISessionClient, string>>(
			new Map(
				// Get job selection from the PresenceState object
				[...presenceManager.getStates().jobSelection.clientValues()].map(
					(cv) => [cv.client, cv.value.jobSelected] as [ISessionClient, string],
				),
			),
		);
		useEffect(() => {
			// Listen to the "updated" event for changes to job selection by remote clients
			return presenceManager.getStates().jobSelection.events.on("updated", (update) => {
				if (jobPresenceMap) {
					const remoteSessionClient = update.client; // The client that updated the state
					const remoteSelectedJobId = update.value.jobSelected; // The job selected by the remote client
					// if empty string, then no job is selected, remove it from the map
					if (remoteSelectedJobId === "") {
						// Remove the job selection if the remote client unselected the job
						jobPresenceMap.delete(remoteSessionClient);
						setJobPresenceMap(new Map(jobPresenceMap));
					} else {
						// Set the new job seletion value for the remove client in our local map
						setJobPresenceMap(
							new Map(jobPresenceMap.set(remoteSessionClient, remoteSelectedJobId)),
						);
					}
				}
			});
		}, []);
		// Get the UserInfo for each job selected by remote clients
		jobPresenceUserInfoList = getJobs().map((job) => {
			return presenceManager.getUserInfo(getKeysByValue(jobPresenceMap, job.jobId));
		});
	}
	// {END MOD_2}

	// Function to set the selected job
	const setSelectedJob = (job: Job | undefined) => {
		props.setSelectedJob(job);

		// {VIEW MOD_2}
		if (presenceManager) {
			// Set the job selection state for the local client, if presence Manager is available
			presenceManager.getStates().jobSelection.local = {
				jobSelected: job ? job.jobId : "",
			};
			// Reset the candidate selection when job selection changes
			presenceManager.getStates().candidateSelection.local = {
				candidateSelected: "",
			};
		}
		// {END MOD_2}
	};

	return (
		<div className="flex flex-col gap-1 content-center w-96 min-w-96 h-full border-r-4 overflow-auto">
			<div className="text-lg p-2 mx-0.5 font-bold bg-cyan-700 text-white text-center">
				Jobs
			</div>
			<div className="flex-grow mx-2">
				{getJobs().map((job, index) => (
					<JobView
						key={index}
						job={job}
						isSelected={props.selectedJob === job}
						setSelectedJob={setSelectedJob}
						deleteJob={(job: Job) => {
							deleteJob(job);
						}}
						// {VIEW MOD_2}
						presenceUserInfoList={jobPresenceUserInfoList[index]}
						// {END MOD_2}
					/>
				))}
			</div>
			<div className="flex mx-2 mb-2 justify-center">
				<button
					aria-label="Add new job"
					className="bg-blue-600 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded w-1/2"
					onClick={() => {
						addJob(createTestJob(false));
					}}
				>
					+ Add New Job
				</button>
			</div>
		</div>
	);
}

// This component displays the details of a job
export function JobView(props: {
	job: Job;
	isSelected: boolean; // Flag to indicate if the job is selected
	setSelectedJob: (job: Job | undefined) => void; // Function to set the selected job
	deleteJob: (job: Job) => void;
	presenceUserInfoList?: UserInfo[];
}): JSX.Element {
	//############################ START MODULE 0 changes here ##############################
	// const [job, setJob] = useState(props.job);
	// 	const getjob = () => {
	// 		return job;
	// 	};
	// 	const setJobTitle = (newTitle: string) => {
	// 		setJob({ ...job, jobTitle: newTitle });
	// 	};
	// 	const setJobDescription = (newDescription: string) => {
	// 		setJob({ ...job, jobDescription: newDescription });
	// 	};
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	useTreeNode(props.job);
	const getjob = () => {
		return props.job;
	};
	const setJobTitle = (newTitle: string) => {
		props.job.jobTitle = newTitle;
	};
	const setJobDescription = (newDescription: string) => {
		props.job.jobDescription = newDescription;
	};
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	return (
		<div
			className={`flex flex-col p-2 justify-center content-center mb-2 mt-2 cursor-pointer 
                ${props.isSelected ? "bg-cyan-50 border border-cyan-300" : "bg-slate-50 hover:bg-slate-100"}
				${props.job.isUnread ? "border-4 border-double border-red-600" : ""}`}
			onClick={() => {
				props.setSelectedJob(props.job);
			}}
		>
			<div className="flex items-center justify-between gap-2">
				<div className="flex flex-grow text-lg font-extrabold bg-transparent text-black">
					{
						// {VIEW MOD_2}
						userAvatarGroupView({
							members: props.presenceUserInfoList,
							size: 24,
							layout: "stack",
						})
						// {END MOD_2}
					}
				</div>
				{props.job.isUnread && (
					<div className="flex items-center">
						<span className="w-2 h-2 bg-red-500 rounded-full"></span>
					</div>
				)}
				<Button
					aria-label="Delete job"
					appearance="subtle"
					icon={<DismissFilled />}
					onClick={(event) => {
						event.stopPropagation();
						props.deleteJob(props.job);
						if (props.isSelected) {
							props.setSelectedJob(undefined);
						}
					}}
				/>
			</div>

			<div className="flex flex-col gap-3 justify-center flex-wrap w-full h-full">
				<div className="flex flex-col gap-3 justify-center content-center m-2">
					<div className="mb-1">
						<label className="block mb-1 text-sm font-medium text-gray-900">
							Title:
							<input
								className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
								value={getjob().jobTitle}
								onChange={(event) => setJobTitle(event.target.value)}
							/>
						</label>
					</div>

					<div className="mb-1">
						<label className="block mb-1 text-sm font-medium text-gray-900">
							Description:
							<textarea
								className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
								value={getjob().jobDescription}
								onChange={(event) => setJobDescription(event.target.value)}
							/>
						</label>
					</div>
				</div>
			</div>
		</div>
	);
}
