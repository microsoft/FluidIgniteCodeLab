# Fluid Framework Code Lab Instructions

## Module 0 - Starting with a non-Fluid app
1. Open the command prompt
2. Checkout the repository - `git clone https://github.com/kashms/hr-recruitment-dashboard.git`
3. Make sure you are on the mod0 branch - `git checkout mod0`
4. Change into the hr-recruitment-dashboard directory - `cd hr-recruitment-dashboard`
5. Launch VSCode to start editing the project - `code .`
6. Update the environment file to add the values needed to run the app
    * Rename the .env.default file to .env
    * Copy over the values from the VM setup including OwningAppId, ContainerTypeId and OwningTenantId to the .env file
    * Copy over the Azure OpenAI APIs endpoint and key to the .env file
    * Save the environment file.
5. Install the dependencies - `npm i`
6. Run the app - `npm run dev`

7. Inspect mod0/appSchema.tsx
8. Open the browser and visit - http://localhost:8080/

### Great! you should see the basic non-Fluid non-collaborative app working now!

## Module 1 - Adding Fluid support
1. Go to tsconfig.json, change line 15 to: `"@lab/*": ["mod1/*"],`
2. Go to webpack.config.cjs, change line 50 to: `"@lab": path.resolve(__dirname, "src/mod1"),`
3. **Restart the app** - Go back to the command prmopt window and type `CTRL+C` on the keyboard, then re-run the `npm run dev` command
4. Go to index.tsx, 
    * comment out line 61 and comment out line 65
    * comment in lines 166-182
5. Go to hr_app.tsx, comment out lines 26-27, comment in lines 21-22

6. Go to jobsListView.tsx, comment in line 19 and line 118
7. Go to candidateListView.tsx, comment in lines 20-21 and line 126
8. Go to onSitePlanView.tsx, comment in lines 16-18
9. Go to interviewPoolView.tsx, comment in line 54
10. Go to availabilityView.tsx comment in line 8
11. Inspect mod1/appSchema.tsx

12. Go back to the browser and refresh the page. Now you should see the URL change to be longer.
13. Copy the longer URL and open another browser tab and paste it. This will allow you to see how multiple users can collaborate on the app. Make any changes in one tab and see them replicated in the other tab immediately!

### Great! Now your app is collaborative using Fluid!

## Module 2 - Adding User Presence
1. Go to tsconfig.json, change line 15 to: `"@lab/*": ["mod2/*"],`
2. Go to webpack.config.cjs, change line 50 to: `"@lab": path.resolve(__dirname, "src/mod2"),`
3. **Restart the app** - Go back to the command prmopt window and type `CTRL+C` on the keyboard, then re-run the `npm run dev` command
4. Go to index.tsx, comment in lines 186-192, surrounded by START MOD_2 block

5. Inspect hr_app.tsx line 96 for the AppPresenceGroup (lines 165-199)
6. Inspect candidatesListView.tsx for listening to remote updates, setting local state and the avatarGroupView
7. Inspect jobsListView.tsx for listening to remote updates, setting local state and the avatarGroupView

8. Re-load both browser tabs. As you select various jobs/candidates in one of the tabs, you should see the presence information showing up in the other tab now!

### Now you can see what jobs and candidates others are looking at in real-time!

## Module 3 - Adding AI Chat view
1. Go to tsconfig.json, change line 15 to: `"@lab/*": ["mod3/*"],`
2. Go to webpack.config.cjs, change line 50 to: `"@lab": path.resolve(__dirname, "src/mod3"),`
3. **Restart the app** - Go back to the command prmopt window and type `CTRL+C` on the keyboard, then re-run the `npm run dev` command
4. Inspect mod3/appSchema.tsx and mod3/aiChatView.tsx
5. Go to hr_app.tsx, comment in lines 75-82, surrounded by the START MOD_3 block

### Congratulations on turning your non-collab react app into a Fluid-powered collab app with User presence and AI features!
