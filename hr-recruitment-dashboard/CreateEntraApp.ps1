$AppName = "Lab440 SPE App" 
$RedirectUri = "http://localhost"  

# Step 1: Sign in to Azure
Write-Output "Signing in to Azure..."

# Step 3: Create an Azure AD application registration
Write-Output "Creating an Azure AD application named $AppName..."
# Create the application and extract both appId and objectId
$app = az ad app create --display-name $AppName --sign-in-audience "AzureADMyOrg" --query "{appId: appId, id: id}" -o json | ConvertFrom-Json

# Extract the appId and objectId
$AppId = $app.appId
$ObjectId = $app.id

# Output the results
Write-Host "AppId: $AppId"
Write-Host "ObjectId: $ObjectId"
Write-Output "Application created with App ID: $AppId"

# Step 4: Add Redirect URI (Optional, modify if necessary)
Write-Output "Adding redirect URI $RedirectUri..."

az rest --method "patch" --uri "https://graph.microsoft.com/v1.0/applications/$ObjectId" --headers "{'Content-Type': 'application/json'}" --body "{'spa': {'redirectUris': [ 'http://localhost' ]}}"

# Step 1: Add permissions for Microsoft Graph API (resourceAppId: 00000003-0000-0000-c000-000000000000)
Write-Output "Adding permissions for Microsoft Graph API..."

# Add delegated permissions (Scope)
az ad app permission add --id $AppId --api 00000003-0000-0000-c000-000000000000 --api-permissions 83b34c85-95bf-497b-a04e-b58eca9d49d0=Scope --only-show-errors
az ad app permission add --id $AppId --api 00000003-0000-0000-c000-000000000000 --api-permissions 5c28f0bf-8a70-41f1-8ab2-9032436ddb65=Scope --only-show-errors
az ad app permission add --id $AppId --api 00000003-0000-0000-c000-000000000000 --api-permissions 085ca537-6565-41c2-aca7-db852babc212=Scope --only-show-errors
az ad app permission add --id $AppId --api 00000003-0000-0000-c000-000000000000 --api-permissions 7427e0e9-2fba-42fe-b0c0-848c9e6a8182=Scope --only-show-errors
az ad app permission add --id $AppId --api 00000003-0000-0000-c000-000000000000 --api-permissions 37f7f235-527c-4136-accd-4a02d197296e=Scope --only-show-errors
az ad app permission add --id $AppId --api 00000003-0000-0000-c000-000000000000 --api-permissions 14dad69e-099b-42c9-810b-d002981feec1=Scope --only-show-errors
az ad app permission add --id $AppId --api 00000003-0000-0000-c000-000000000000 --api-permissions 89fe6a52-be36-487e-b7d8-d061c450a026=Scope --only-show-errors

Start-Sleep -Seconds 2

# Add application permission (Role)
Write-Output "Adding permissions for applcation API..."
az ad app permission add --id $AppId --api 00000003-0000-0000-c000-000000000000 --api-permissions 40dc41bc-0f7e-42ff-89bd-d9516947e474=Role --only-show-errors

Start-Sleep -Seconds 2

# Step 2: Add permissions for another API (resourceAppId: 00000003-0000-0ff1-ce00-000000000000)
Write-Output "Adding permissions for Push API..."
az ad app permission add --id $AppId --api 00000003-0000-0ff1-ce00-000000000000 --api-permissions 19766c1b-905b-43af-8756-06526ab42875=Role --only-show-errors

Start-Sleep -Seconds 15

# Step 3: Grant admin consent
Write-Output "Granting admin consent for the permissions..."
az ad app permission admin-consent --id $AppId

# Step 4: Verify permissions
Write-Output "Verifying permissions..."
az ad app permission list --id $AppId --output table