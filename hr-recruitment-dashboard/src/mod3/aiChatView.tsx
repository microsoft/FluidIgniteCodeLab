/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { asTreeViewAlpha } from "@fluidframework/tree/alpha";
import { Tree, TreeNode, TreeView } from "@fluidframework/tree";
import { aiCollab, AiCollabOptions } from "@fluidframework/ai-collab/alpha";
import { AzureOpenAI } from "openai";
import { HRData, OnSiteSchedule } from "./appSchema.js";

export interface AiChatViewProps {
	treeRoot: TreeView<typeof HRData>;
	showAnimatedFrame: (show: boolean) => void;
}

export function AiChatView(props: AiChatViewProps): JSX.Element {
	const executeAIChat = async () => {
		props.showAnimatedFrame(true);

		const inputPromptElement = document.getElementById(
			"ai-job-creation-input",
		) as HTMLInputElement;
		const inputPrompt = inputPromptElement.value;

		// Fetch our API key and endpoint from the environment variables.
		const apiKey = process.env.AZURE_OPENAI_API_KEY;
		if (apiKey === null || apiKey === undefined) {
			throw new Error("AZURE_OPENAI_API_KEY environment variable not set");
		}

		const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
		if (endpoint === null || endpoint === undefined) {
			throw new Error("AZURE_OPENAI_ENDPOINT environment variable not set");
		}

		const viewAlpha = asTreeViewAlpha(props.treeRoot);

		// Create a new branch to make changes to the tree; main branch of tree is unaffected
		// The changes to branch are not available/visible to other clients until the branch is merged to the main branch.
		const newBranchFork = viewAlpha.fork();

		const aiCollabOptions: AiCollabOptions = {
			// Here we are creating a new AzureOpenAI client with the provided API key and endpoint.
			// You can also use OpenAI apis directly with model gpt-4o for similar results.
			// Since we are using this in a controlled lab setting, we are using the apiKey method to authenticate our calls.
			// Ideally, you should use other secure methods to authenticate your calls to LLM APIs.
			openAI: {
				client: new AzureOpenAI({
					endpoint: endpoint,
					deployment: "gpt-4o",
					apiKey: apiKey,
					apiVersion: "2024-08-01-preview",
					dangerouslyAllowBrowser: true,
				}),
				modelName: "gpt-4o",
			},
			/*
			The following options are also available:
			planningStep: When enabled, the LLM will be prompted to first produce a plan based on the user's ask before generating changes to your applications data
			finalReviewStep: When enabled, the LLM will be prompted with a final review of the changes they made to confirm their validity.
			*/
			// planningStep: true,
			// finalReviewStep: true,
			treeNode: newBranchFork.root,
			prompt: {
				// The primary system prompt given to the AI to explain application context and the user's ask.
				systemRoleContext:
					"You are an assistant that is helping out with a recruitment tool. You help draft job roles and responsibilities. You also help with on site interview plans and schedule." +
					"Some important information about the schema that you should be aware -- Each Candidate is uniquely identified by `candidateId` field. Each Interviewer is uniquely identified by `interviewerId` field." +
					"Each Job is uniquely identified by `jobId` field. Each job has an OnSiteSchedule array which is list of scheduled onsite interviews. An OnSiteSchedule object has candidateId which indicates the candidate for onsite and interviewerIds array" +
					" indicates which interviewers are doing the interviews. These ids help identify the candidate and interviewers uniquely and help map their objects in the app." +
					"Lastly, any object you update, make sure to set the `isUnread` field to true to indicate that the LLM or AI help was used. Only set the `llmCollboration` fields of object that you modify, not others.",
				// the user prompt, currently passed directly to the LLM.
				userAsk: inputPrompt,
			},
			limiters: {
				maxModelCalls: 40,
			},
			// Optionally dump the debug log to the console.
			dumpDebugLog: true,
			// An optional validator function that can be used to validate the new content produced by the LLM.
			// Here, we are calling our existing validation function that ensures only available interviewers are scheduled for onsite by LLM.
			validator: (treeNode: TreeNode) => {
				const schemaIdentifier = Tree.schema(treeNode).identifier;
				if (schemaIdentifier === OnSiteSchedule.identifier) {
					(treeNode as OnSiteSchedule).validateInterviewers(
						newBranchFork.root.interviewerPool,
					);
				}
			},
		};

		try {
			// Make the call to LLM and let it make changes to the tree based on user input.
			const response = await aiCollab(aiCollabOptions);
			console.log("This will run if there's no error.");
			console.log("received response from llm");
			console.log(response);

			if (response.status === "success") {
				console.log("AI has completed request successfully");
				props.showAnimatedFrame(false);
				// Currently, we immediately merge the changes to the main branch of the tree.
				// You can design user interface to prompt the user to review the changes before they are merged.
				// User can also have the option to undo the changes and not merge them to the main branch.
				viewAlpha.merge(newBranchFork);
			} else {
				console.log("Copilot: Something went wrong processing your request");
				props.showAnimatedFrame(false);
			}
		} catch (error) {
			console.error("Caught an error:", error);
		}
	};

	return (
		<div className="flex-grow flex flex-row gap-1 content-center w-96">
			<input
				aria-label="Input text box for Ask AI for help"
				id="ai-job-creation-input"
				className="bg-gray-50 p-2.5 flex-grow border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-blue-500 block"
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						executeAIChat();
					}
				}}
			/>
			<button
				aria-label="Ask AI for help"
				className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fit"
				onClick={() => executeAIChat()}
			>
				Ask AI for help!
			</button>
		</div>
	);
}
