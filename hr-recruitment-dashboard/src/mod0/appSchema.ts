/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

// The Availability class extends the Array class to manage a list of available days for Candidates and Interviewers.
export class Availability extends Array<string> {
	constructor();
	constructor(days: number);
	constructor(days: string[]);
	constructor(...days: string[]);
	constructor(days?: number | string[] | string, ...rest: string[]) {
		super();
		if (typeof days === "number") {
			this.length = days;
		} else if (Array.isArray(days)) {
			this.push(...days);
		} else {
			this.push(...[days, ...rest].filter((day): day is string => typeof day === "string"));
		}
	}

	// Method to set the availability of a specific day.
	public readonly setDayAvailability = (day: string, available: boolean) => {
		if (available && !this.includes(day)) {
			// If the day is available and not already in the array, add it to the beginning.
			this.unshift(day);
		} else {
			// If the day is not available, remove it from the array.
			const index = this.indexOf(day);
			if (index !== -1) {
				this.splice(index, 1);
			}
		}
	};
}

// The OnSiteSchedule class represents a schedule for an on-site interview.
export class OnSiteSchedule {
	day: string;
	interviewerIds: string[];
	candidateId: string;
	isUnread: boolean = false;

	constructor({
		day,
		interviewerIds,
		candidateId,
		isUnread,
	}: {
		day: string;
		interviewerIds: string[];
		candidateId: string;
		isUnread: boolean;
	}) {
		this.day = day;
		this.interviewerIds = interviewerIds;
		this.candidateId = candidateId;
		this.isUnread = isUnread;
	}

    // Method to add an interviewer to the schedule.
	public readonly addInterviewer = (interviewerId: string) => {
		this.interviewerIds.push(interviewerId);
	};

	// Method to remove an interviewer from the schedule.
	public readonly removeInterviewer = (interviewerId: string) => {
		const index = this.interviewerIds.indexOf(interviewerId);
		this.interviewerIds.splice(index, 1);
	};
}

// The Interviewer class represents an interviewer with their details and availability.
export class Interviewer {
	role: string;
	interviewerId: string;
	name: string;
	availability: Availability;

	constructor({
		role,
		interviewerId,
		name,
		availability,
	}: {
		role: string;
		interviewerId: string;
		name: string;
		availability: Availability;
	}) {
		this.role = role;
		this.interviewerId = interviewerId;
		this.name = name;
		this.availability = availability;
	}
}

// The Candidate class represents a candidate with their details and availability.
export class Candidate {
	name: string;
	candidateId: string;
	yearsOfExperience: number;
	availability: Availability;
	isUnread: boolean = false;

	constructor({
		name,
		candidateId,
		yearsOfExperience,
		availability,
		isUnread,
	}: {
		name: string;
		candidateId: string;
		yearsOfExperience: number;
		availability: Availability;
		isUnread: boolean;
	}) {
		this.name = name;
		this.candidateId = candidateId;
		this.yearsOfExperience = yearsOfExperience;
		this.availability = availability;
		this.isUnread = isUnread;
	}
}

// The Job class represents a job with its details, candidates, and on-site schedules.
export class Job {
	jobId: string;
	jobTitle: string;
	jobDescription: string;
	candidates: Candidate[];
	onSiteSchedule: OnSiteSchedule[];
	isUnread: boolean;

	constructor({
		jobId,
		jobTitle,
		jobDescription,
		candidates,
		onSiteSchedule,
		isUnread,
	}: {
		jobId: string;
		jobTitle: string;
		jobDescription: string;
		candidates: Candidate[];
		onSiteSchedule: OnSiteSchedule[];
		isUnread: boolean;
	}) {
		this.jobId = jobId;
		this.jobTitle = jobTitle;
		this.jobDescription = jobDescription;
		this.candidates = candidates;
		this.onSiteSchedule = onSiteSchedule;
		this.isUnread = isUnread;
	}

	// Method to add a new on-site schedule for a candidate.
	public readonly addNewOnSiteForCandidate = (candiadteId: string) => {
		const newOnSite = new OnSiteSchedule({
			day: "Monday",
			interviewerIds: [],
			candidateId: candiadteId,
			isUnread: false,
		});
		this.onSiteSchedule.push(newOnSite);
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
		this.candidates.push(candidate);
	};
}

// The JobsArray class extends the Array class to manage a list of Job objects.
export class JobsArray extends Array<Job> {
	public addJob(job: Job) {
		this.push(job);
	}

	public deleteJob(job: Job) {
		const index = this.indexOf(job);
		this.splice(index, 1);
	}
}

// The InterviewerPool class extends the Array class to manage a list of Interviewer objects.
export class InterviewerPool extends Array<Interviewer> {}

// The HRData class represents the overall HR data including jobs and interviewers.
export class HRData {
	jobsList: JobsArray;
	interviewerPool: InterviewerPool;

	constructor({
		jobsList,
		interviewerPool,
	}: {
		jobsList: Job[];
		interviewerPool: Interviewer[];
	}) {
		this.jobsList = new JobsArray(...jobsList);
		this.interviewerPool = new InterviewerPool(...interviewerPool);
	}
}

export const treeConfiguration = undefined;
