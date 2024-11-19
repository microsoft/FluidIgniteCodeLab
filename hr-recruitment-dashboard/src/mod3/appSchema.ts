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
	day: sf.required(sf.string, {
		metadata: {
			description:
				"The day of the week that the candidate is scheduled for an onsite interview. This field is required. Candidate and interviewers should be available on the day of the onsite interview.",
		},
	}),
	interviewerIds: sf.required(sf.array(sf.string), {
		metadata: {
			description:
				"The interviewerId of interviewers part of the onsite. This field is required. The default is an empty array. There have to be 3 interviewers for each onsite interview. The ids in this array should map to interviewerId field in Interviewer object",
		},
	}),
	candidateId: sf.required(sf.string, {
		metadata: {
			description:
				"The candidateId of the candidate that is scheduled for an onsite interview. This field is required. The candidateId should map to the id field in the Candidate object",
		},
	}),
	isUnread: sf.required(sf.boolean, {
		metadata: {
			description:
				"The boolean value that determines if the LLM or AI help was used. This field is required. The default is false. This field should be set to true when llm or ai makes any edits to any objects of this type",
		},
	}),
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

	// Method to validate the interviewerIds in the OnSiteSchedule against the InterviewerPool.
	// This is used by the AI Collab library to ensure that the onsite interviewers are valid.
	public validateInterviewers(interviewerPool: InterviewerPool): void {
		this.interviewerIds.forEach((interviewerId) => {
			const interviewer = interviewerPool.find(
				(person) => person.interviewerId === interviewerId,
			);
			if (interviewer === undefined) {
				throw new Error(
					`You cannot assign the interviewerId ${interviewerId} to this OnSiteSchedule because there are no existing interviewers within the InterviewerPool with that id.`,
				);
			}

			if (interviewer.availability.includes(this.day) === false) {
				throw new Error(
					`You cannot assign the interviewer with id "${interviewerId}" and name "${interviewer.name}" to this OnSiteSchedule because it is scheduled to take place on a ${this.day} and the interviewer does NOT have availability for that day.`,
				);
			}
		});
	}
}

// The Interviewer class represents an interviewer with their details and availability.
export class Interviewer extends sf.object("Interviewer", {
	role: sf.string,
	interviewerId: sf.required(sf.string, {
		metadata: {
			description:
				"The unique identifier of the interviewer. This field is required. This field is used to cross identify and reference the interviewer in the OnSiteSchedule",
		},
	}),
	name: sf.required(sf.string, {
		metadata: {
			description: "The name of the interviewer. This field is required.",
		},
	}),
	availability: sf.required(Availability, {
		metadata: {
			description: "The availability of the interviewer. This field is required.",
		},
	}),
}) { }

// The Candidate class represents a candidate with their details and availability.
export class Candidate extends sf.object("Candidate", {
	name: sf.string,
	candidateId: sf.required(sf.string, {
		metadata: {
			description:
				"The unique identifier of the candidate. This field is required. This field is used to cross identify and reference the candidate in the OnSiteSchedule.",
		},
	}),
	yearsOfExperience: sf.number,
	availability: sf.required(Availability, {
		metadata: {
			description:
				"The availability of the candidate. This field is required. The default is an empty array." +
				"For this field, the only allowed values are the strings Monday,Tuesday,Wednesday,Thursday,Friday",
		},
	}),
	isUnread: sf.required(sf.boolean, {
		metadata: {
			description:
				"The boolean value that determines if the LLM or AI help was used. This field is required. The default is false. This field should be set to true when llm or ai makes any edits to any objects of this type",
		},
	}),
}) { }

// The Job class represents a job with its details, candidates, and on-site schedules.
export class Job extends sf.object("Job", {
	jobId: sf.string,
	jobTitle: sf.required(sf.string, {
		metadata: {
			description: `The title of the job. This field is required. Titles are short and clear`,
		},
	}),
	jobDescription: sf.required(sf.string, {
		metadata: {
			description: `The description of the job. This field is required. For this field include a brief description of the job.`,
		},
	}),
	candidates: sf.required(sf.array(Candidate), {
		metadata: {
			description: `The candidates who have applied for this job. This field is required. The default is an empty array. The objects of type Candidate are put in arrays here.`,
		},
	}),
	onSiteSchedule: sf.required(sf.array(OnSiteSchedule), {
		metadata: {
			description: `The schedule of the onsite interviews. This field is required. The default is an empty array. The objects of type OnSiteSchedule are put in arrays here. A valid onsite schedule should have an onsite interview day when the candidate is available, 3 available interviewers and a candidate.`,
		},
	}),
	isUnread: sf.required(sf.boolean, {
		metadata: {
			description:
				"The boolean value that determines if the LLM or AI help was used. This field is required. The default is false. This field should be set to true when llm or ai makes any edits to any objects of this type",
		},
	}),
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
	interviewerPool: sf.required(InterviewerPool, {
		metadata: {
			description: `The interviewers who have been allowed to interview candidates that have applied to this role.
				This field is required. The default is an empty array. The objects of type Interviewer are put in arrays here.
				Interviewers should not be removed from this array.`,
		},
	}),
}) { }

export const treeConfiguration = new TreeViewConfiguration({ schema: HRData });
