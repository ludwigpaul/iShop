# Deployment Issues Summary

## 1. SSH Authentication Failure

- **Symptom:**  
  `Permission denied (publickey)` error when attempting to SSH into the Compute Engine instance.

- **Root Causes:**
    - The deployment script did not specify the correct SSH username, causing authentication to fail.
    - The project metadata contained `ssh-keys` entries, so GCP expected a username matching one of those keys (e.g., `root` or `sa_105782201469785741507`).
    - OS Login was not enabled, so IAM-based SSH keys were not used.

- **Resolution:**  
  Updated the deployment script to explicitly specify the correct username in the SSH command.

---

## 2. Docker Image Pull Failure

- **Symptom:**  
  Docker failed to pull the application image with the error:  
  `pull access denied for ****/ishop, repository does not exist or may require 'docker login'`

- **Root Causes:**
    - The Docker image name was incorrect, misspelled, or did not exist on Docker Hub.
    - The image was private, and Docker Hub authentication was not performed on the VM.

- **Resolution:**
    - Verified the Docker image name and repository.
    - If the image is private, ensured to run `docker login` on the VM before pulling the image.

---

## 3. Health Check Script Improvements

- **Symptom:**  
  Health check script required robust retry logic and better debugging output.

- **Resolution:**
    - Implemented retries and fallback to the root endpoint.
    - Added debug information collection on failure.

---

## 4. Health Check SSH Failure

- **Symptom:**
  Health check script failed to SSH into the instance for debugging, showing `Permission denied (publickey)`.

- **Root Causes:**
    - The health check or debug step used the wrong SSH username or did not match a key in project metadata.
    - The SSH command may have defaulted to `root` or another user not present in the `ssh-keys` metadata.

- **Resolution:**
    - Ensure all SSH commands (including health checks) use a username present in the `ssh-keys` metadata (e.g., `sa_105782201469785741507`).
    - Update scripts to consistently specify the correct SSH username.

---

**Summary:**  
The main issues were related to SSH authentication (username mismatch and metadata configuration) and Docker image access (repository or authentication problems). These were resolved by updating the deployment script and verifying Docker credentials.