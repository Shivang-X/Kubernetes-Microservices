resource "google_service_account" "kubernetes" {
    account_id = "csci-5409-k8s"
}

resource "google_artifact_registry_repository_iam_member" "repo-iam" {
  location = "us-central1"
  repository = "k8s"
  role   = "roles/artifactregistry.reader" # Example role
  member = "serviceAccount:${google_service_account.kubernetes.email}"   # Service account email
}

resource "google_container_node_pool" "general" {
  name = "general"
  cluster = google_container_cluster.primary.id
  node_count = 1

  node_config {
    preemptible = true
    machine_type = "e2-standard-2"
    disk_type = "pd-standard"                                                    
    disk_size_gb = 10

    service_account = google_service_account.kubernetes.email
    oauth_scopes    = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}