/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	Availability,
	Candidate,
	HRData,
	Interviewer,
	Job,
	OnSiteSchedule,
} from "@lab/appSchema.js";

export function createTestAppData() {
	const interviewers = [
		new Interviewer({
			interviewerId: "10",
			name: "Alice Johnson",
			role: "Technical Lead",
			availability: new Availability(["Monday", "Tuesday", "Wednesday"]),
		}),
		new Interviewer({
			interviewerId: "20",
			name: "Bob Smith",
			role: "HR Manager",
			availability: new Availability(["Monday", "Tuesday", "Wednesday"]),
		}),
		new Interviewer({
			interviewerId: "30",
			name: "Charlie Brown",
			role: "Senior Developer",
			availability: new Availability(["Thursday", "Friday"]),
		}),
		new Interviewer({
			interviewerId: "40",
			name: "Diana Prince",
			role: "Project Manager",
			availability: new Availability(["Thursday", "Friday"]),
		}),
		new Interviewer({
			interviewerId: "50",
			name: "Ethan Hunt",
			role: "QA Engineer",
			availability: new Availability(["Thursday", "Friday"]),
		}),
		new Interviewer({
			interviewerId: "60",
			name: "Fiona Gallagher",
			role: "DevOps Engineer",
			availability: new Availability(["Friday"]),
		}),
		new Interviewer({
			interviewerId: "70",
			name: "George Martin",
			role: "Product Owner",
			availability: new Availability(["Monday", "Tuesday", "Thursday", "Friday"]),
		}),
	];

	const hrData = new HRData({
		jobsList: [createTestJob(true)],
		interviewerPool: interviewers,
	});
	return hrData;
}

export function createTestCandidate() {
	const candidate = new Candidate({
		candidateId: Math.floor(Math.random() * 1001).toString(),
		name: getNextName(),
		yearsOfExperience: Math.floor(Math.random() * 20) + 1,
		availability: createFullyAvailable(),
		isUnread: false,
	});
	return candidate;
}

export function createTestJob(addCandidates: boolean) {
	const candidates = [
		new Candidate({
			candidateId: "1",
			name: "John Doe",
			yearsOfExperience: 5,
			availability: createFullyAvailable(),
			isUnread: false,
		}),
	];

	const onSiteSchedule = new OnSiteSchedule({
		day: "Monday",
		interviewerIds: ["10", "20", "70"],
		candidateId: "1",
		isUnread: false,
	});

	const job = new Job({
		jobId: Math.floor(Math.random() * 1001).toString(),
		jobTitle: "Software Engineer",
		jobDescription:
			`We are seeking a Software Engineer to join our Microsoft Teams team, specializing in Enterprise Voice features. As an individual contributor, ` +
			`you will lead the development, optimization, and maintenance of high-quality web applications, ensuring seamless integration with voice over ` +
			`internet protocol (VoIP) and telephony systems. Collaborate with cross-functional teams to drive innovative solutions, enhance performance, and ensure reliability. ` +
			`Microsoft’s mission is to empower every person and every organization on the planet to achieve more. As employees we come together with a growth mindset, ` +
			`innovate to empower others, and collaborate to realize our shared goals. Each day we build on our values of respect, integrity, and accountability to create a ` +
			`culture of inclusion where everyone can thrive at work and beyond. \n` +
			`Responsibilities
		- Web UI: Develop responsive web interfaces, leveraging modern front-end libraries and frameworks like React, Angular, or Vue.js to build intuitive user experiences.
		- Automation and Tools: Create and refine internal tools to improve the stability of our products through automated testing, and minimize ` +
			`long-term maintenance, release, and support costs. 
		- Research and Innovation: Stay informed about the latest trends in web technologies and tools, supporting the team in integrating new ` +
			`technologies to maintain competitiveness and innovation. 
		- Technical Support and Collaboration: Work in a large cross-functional engineering team to implement end-to-end solutions by participating ` +
			`in team and cross-functional discussions. Collaborate with Product Managers with diverse technological backgrounds. Work with support teams ` +
			`and solve technical problems as they arise. \n` +
			`Qualifications
		Required Qualifications:
		- Bachelor's Degree in Computer Science, or related technical discipline with proven experience coding in languages including, but not limited to, ` +
			`C, C++, C#, Java, JavaScript, or Python OR equivalent experience.
		- Experience with front-end web development and frameworks like React, Angular, or Vue.js. 
		- Experience with full-stack development, including databases and cloud technologies. \n` +
			`Preferred Qualifications:
		- Bachelor's Degree in Computer Science or related technical field AND 1+ year(s) technical engineering experience with coding in languages including, but not ` +
			`limited to, C, C++, C#, Java, JavaScript, or Python OR Master's Degree in Computer Science or related technical field with proven experience coding in ` +
			`languages including, but not limited to, C, C++, C#, Java, JavaScript, or Python OR equivalent experience.
		- Experience with back-end development in Node.js, .NET, or Python. 
		- Understanding of data structures, design patterns, and asynchronous programming.`,
		candidates: addCandidates ? candidates : [],
		onSiteSchedule: addCandidates ? [onSiteSchedule] : [],
		isUnread: false,
	});
	return job;
}

const names = [
	"Carlos Hernandez",
	"Yuki Nakamura",
	"Liam O'Connor",
	"Maria Garcia",
	"Sofia Rossi",
	"Elena Petrova",
	"Jane Doe",
	"John Smith",
	"Amir Patel",
	"Robert Brown",
	"Emily Davis",
	"Michael Wilson",
	"Sarah Miller",
	"David Moore",
	"Laura Taylor",
	"James Anderson",
	"Wei Zhang",
];
let currentIndex = 0;

function getNextName() {
	const name = names[currentIndex];
	currentIndex = (currentIndex + 1) % names.length;
	return name;
}

function createFullyAvailable() {
	const avail = new Availability(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
	return avail;
}
