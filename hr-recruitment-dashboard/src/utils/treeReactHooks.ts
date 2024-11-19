/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Tree, type TreeNode } from "@fluidframework/tree";
import * as React from "react";

/**
 * React hook that subscribes to the treeChanged event of the given TreeNode.
 * This hook will trigger a re-render of the component whenever the tree changes.
 * @param subtreeRoot - The root of the subtree to watch for changes.
 */
export function useTree(subtreeRoot: TreeNode): void {
	// Use a React effect hook to invalidate this component when the subtreeRoot changes.
	// We do this by incrementing a counter, which is passed as a dependency to the effect hook.
	const [invalidations, setInvalidations] = React.useState(0);

	// React effect hook that increments the 'invalidation' counter whenever subtreeRoot or any of its children change.
	React.useEffect(() => {
		// Returns the cleanup function to be invoked when the component unmounts.
		return Tree.on(subtreeRoot, "treeChanged", () => {
			setInvalidations((i) => i + 1);
		});
	}, [invalidations, subtreeRoot]);
}

/**
 * React hook that subscribes to the nodeChanged event of the given TreeNode.
 * This hook will trigger a re-render of the component whenever the node changes.
 * @param subtreeRoot - The root of the subtree to watch for changes.
 */
export function useTreeNode(subtreeRoot: TreeNode): void {
	// Use a React effect hook to invalidate this component when the subtreeRoot changes.
	// We do this by incrementing a counter, which is passed as a dependency to the effect hook.
	const [invalidations, setInvalidations] = React.useState(0);

	// React effect hook that increments the 'invalidation' counter whenever subtreeRoot.
	React.useEffect(() => {
		// Returns the cleanup function to be invoked when the component unmounts.
		return Tree.on(subtreeRoot, "nodeChanged", () => {
			setInvalidations((i) => i + 1);
		});
	}, [invalidations, subtreeRoot]);
}
