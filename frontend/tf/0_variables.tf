
# environment vars
variable "aws_region" {}
variable "env" {}
variable "out_dir" {}
variable "tf_dir" {}

locals {
  page_url = "thesocialwatcher.com"
  www_page_url = "www.thesocialwatcher.com"
  tags = {
    project = "social watcher"
  }
}
