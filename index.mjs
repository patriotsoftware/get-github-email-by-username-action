//const { Octokit } = require("@octokit/core");
import { Octokit } from '@octokit/rest';
const octokit = new Octokit();
const core = require('@actions/core');

// attempt to piece together Patriot email (ugly, but last alternative)
function fabricatePatriotEmail(name) {
  // Split the name into parts
  const parts = name.trim().split(" ");
 
  // Extract the first name and last name (middle name is excluded)
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];

  // check for valid last name length
  if(lastName.length <= 2) return null;
  
  // Create the desired format and convert to lowercase
  const generatedEmail = `${firstName[0]}${lastName}@patriotsoftware.com`.toLowerCase();
  console.log("[*] Generated Patriot email:" + generatedEmail);
  
  return generatedEmail;
}

try {
  //inputs defined in action metadata file
  const usernameForEmail = core.getInput('github-username');
  const token = core.getInput('token');

  console.log(`[*] Getting ${usernameForEmail}\'s GitHub email`);

  //attempt to use auth token to get email via accessing the user's API page
  let userAPIData = null;
  try {
    const octokit = new Octokit({ auth: `${token}` });
    userAPIData = await octokit.request(`GET /users/${usernameForEmail}`, {});
  } catch (error) {
    console.log("[!] " + error.message);
  }

  // Extract the email if the user's API was accessed successfully
  let emailUserpage = null;
  const u_email = null;
  const u_name =  null;
  if (userAPIData != null && userAPIData.data != null) {
    u_email = userAPIData.data.email;
    u_name =  userAPIData.data.name;   
  }

  // Patriot email required
  if (u_email != null && u_email != "" & u_email.indexOf("@patriotsoftware.com") > 0) {
    emailUserpage = u_email;
  }     
  else if (u_name != null && u_name != ""){
    emailUserpage = fabricatePatriotEmail(u_name);
  }

  //email not found on user's API page or failed to authenticate with token
  if (emailUserpage == null) {
    console.log(`[*] Unable to find Patriot email. Please verify user's GitHub profile configuration.`);
  }
  else {
    console.log(`[*] Found ${usernameForEmail}\'s email: ${emailUserpage}`)
    core.setOutput("email", emailUserpage);
  }

} catch (error) {
  core.setFailed(error.message);
}