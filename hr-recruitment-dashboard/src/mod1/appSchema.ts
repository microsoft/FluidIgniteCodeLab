/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { TreeViewConfiguration, SchemaFactory } from "fluid-framework";

// Define a schema factory that is used to generate classes for the schema
const sf = new SchemaFactory("ef0b8eff-2876-4801-9b6a-973f09aab904");

// The Availability class extends the Array class to manage a list of available days.
export class Availability extends sf.array("Availability", sf.string) {
	// Method to set the availability of a specific day.
	public readonly setDayAvailability = (day: string, available: boolean) => {
		if (available && !this.includes(day)) {
			this.insertAtStart(day);
		} else {
			const index = this.indexOf(day);
			if (index !== -1) {
				this.removeAt(index);
			}
		}
	};
}

// The OnSiteSchedule class represents a schedule for an on-site interview.
export class OnSiteSchedule extends sf.object("OnSiteSchedule", {
	day: sf.required(sf.string),
	interviewerIds: sf.required(sf.array(sf.string)),
	candidateId: sf.required(sf.string),
	isUnread: sf.required(sf.boolean),
}) {
	// Method to add an interviewer to the schedule.
	public readonly addInterviewer = (interviewerId: string) => {
		if (this.interviewerIds.includes(interviewerId)) {
			return;
		}
		this.interviewerIds.insertAtEnd(interviewerId);
	};

	// Method to remove an interviewer from the schedule.
	public readonly removeInterviewer = (interviewerId: string) => {
		const index = this.interviewerIds.indexOf(interviewerId);
		if (index !== -1) {
			this.interviewerIds.removeAt(index);
		}
	};
}

// The Interviewer class represents an interviewer with their details and availability.
export class Interviewer extends sf.object("Interviewer", {
	role: sf.string,
	interviewerId: sf.required(sf.string),
	name: sf.required(sf.string),
	availability: sf.required(Availability),
}) {}

// The Candidate class represents a candidate with their details and availability.
export class Candidate extends sf.object("Candidate", {
	name: sf.string,
	candidateId: sf.required(sf.string),
	yearsOfExperience: sf.number,
	availability: sf.required(Availability),
	isUnread: sf.required(sf.boolean),
}) {}

// The Job class represents a job with its details, candidates, and on-site schedules.
export class Job extends sf.object("Job", {
	jobId: sf.string,
	jobTitle: sf.required(sf.string),
	jobDescription: sf.required(sf.string),
	candidates: sf.required(sf.array(Candidate)),
	onSiteSchedule: sf.required(sf.array(OnSiteSchedule)),
	isUnread: sf.required(sf.boolean),
}) {
	// Method to add a new on-site schedule for a candidate.
	public readonly addNewOnSiteForCandidate = (candiadteId: string) => {
		const newOnSite = new OnSiteSchedule({
			day: "Monday",
			interviewerIds: [],
			candidateId: candiadteId,
			isUnread: false,
		});
		this.onSiteSchedule.insertAtEnd(newOnSite);
	};

	// Method to check if there is an on-site schedule for a candidate.
	public readonly hasOnSiteForCandidate = (candidateId: string) => {
		return !!this.getOnSiteForCandidate(candidateId);
	};

	// Method to get the on-site schedule for a candidate.
	public readonly getOnSiteForCandidate = (candidateId: string) => {
		return this.onSiteSchedule.find((onSite) => onSite.candidateId === candidateId);
	};

	// Method to add a candidate to the job.
	public readonly addCandidate = (candidate: Candidate) => {
		this.candidates.insertAtEnd(candidate);
	};
}

// The JobsArray class extends the Array class to manage a list of Job objects.
export class JobsArray extends sf.array("JobsArray", Job) {
	public readonly addJob = (job: Job) => {
		this.insertAtEnd(job);
	};

	public readonly deleteJob = (job: Job) => {
		const index = this.indexOf(job);
		if (index !== -1) {
			this.removeAt(index);
		}
	};
}

// The InterviewerPool class extends the Array class to manage a list of Interviewer objects.
export class InterviewerPool extends sf.array("InterviewerPool", Interviewer) {}

// The HRData class represents the overall HR data including jobs and interviewers.
export class HRData extends sf.object("HRData", {
	jobsList: JobsArray,
	interviewerPool: sf.required(InterviewerPool),
}) {}

export const treeConfiguration = new TreeViewConfiguration({ schema: HRData });
