
# environment vars
variable "aws_region" {}
variable "env" {}
variable "out_dir" {}
variable "tf_dir" {}

locals {
  tags = {
    project = "social watcher"
  }
}
