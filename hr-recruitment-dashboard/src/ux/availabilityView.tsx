/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState } from "react";
import { Availability } from "@lab/appSchema.js";
import { DAYS_OF_WEEK, DAYS_OF_WEEK_SHORT } from "../utils/util.js";
import { useTree } from "../utils/treeReactHooks.js";

// Component to display the availability status of a Candidate or Interviewer
export function AvailabilityView(props: { avail: Availability; readOnly?: boolean }): JSX.Element {
	//############################ START MODULE 0 changes here ##############################
	// State to manage the availability
	// const [avail, setAvail] = useState(props.avail);
	// const getAvail = (): Availability => {
	// 	return avail;
	// };
	// // Function to set the availability for a specific day
	// const setDayAvailability = (day: string, checked: boolean) => {
	// 	avail.setDayAvailability(day, checked);
	// 	const newAvail = new Availability(avail);
	// 	setAvail(newAvail);
	// };
	//////////////////////////////// END MODULE 0 changes here //////////////////////////////

	//############################ START MODULE 1 changes here ##############################
	useTree(props.avail);
	const getAvail = () => {
		return props.avail;
	};
	const setDayAvailability = (day: string, checked: boolean) => {
		// Set the availability for a specific day directly on the props.avail Fluid Object
		// This will also set the availability for remote clients
		props.avail.setDayAvailability(day, checked);
	};
	//////////////////////////////// END MODULE 1 changes here //////////////////////////////

	return (
		<div className="flex flex-col gap-1 justify-center content-center m-1">
			<div className="flex flex-row gap-1">
				{DAYS_OF_WEEK.map((day, index) => {
					const availability = getAvail();
					try {
						return (
							<DayView
								key={day}
								dayName={DAYS_OF_WEEK_SHORT[index]}
								isAvailable={availability.includes(day)}
								readOnly={props.readOnly}
								onChange={(checked: boolean) => setDayAvailability(day, checked)}
							/>
						);
					} catch (error) {
						console.error(error);
					}
				})}
			</div>
		</div>
	);
}

// DayView component to display the availability status of a specific day
export function DayView(props: {
	dayName: string; // Name of the day (e.g., "Monday")
	isAvailable: boolean; // Availability status for the day
	readOnly?: boolean; // Optional prop to make the view read-only
	onChange: (checked: boolean) => void; // Callback function to handle changes in availability
}): JSX.Element {
	return (
		<div
			className={`flex flex-col items-center justify-center p-1 rounded w-14 
				${props.isAvailable ? "bg-green-300" : "bg-red-300"}
				${props.readOnly ? "" : "cursor-pointer"}`} // Add cursor pointer if not read-only
			onClick={(event) => {
				if (!props.readOnly) {
					// Only handle click if not read-only
					event.stopPropagation(); // Prevent event from bubbling up
					props.onChange(!props.isAvailable); // Toggle availability status
				}
			}}
			role="button"
			tabIndex={props.readOnly ? -1 : 0}
			aria-pressed={props.isAvailable}
			aria-label={`${props.isAvailable ? "" : "Not "} Available on ${props.dayName}`}
			onKeyDown={(event) => {
				if (!props.readOnly && (event.key === "Enter" || event.key === " ")) {
					// Only handle key press if not read-only and key is Enter or Space
					event.preventDefault(); // Prevent default action
					props.onChange(!props.isAvailable); // Toggle availability status
				}
			}}
			style={{
				backgroundImage: props.isAvailable
					? "none"
					: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23FF4444" viewBox="0 0 24 24"><path d="M12 10.586l4.95-4.95 1.414 1.414L13.414 12l4.95 4.95-1.414 1.414L12 13.414l-4.95 4.95-1.414-1.414L10.586 12 5.636 7.05l1.414-1.414L12 10.586z"/></svg>')`,
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				backgroundSize: "48px 48px",
			}}
		>
			<label className="block mb-1 text-sm font-medium text-gray-900 select-none">
				{props.dayName}
			</label>
		</div>
	);
}
