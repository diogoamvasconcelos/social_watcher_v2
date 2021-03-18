# environment vars
variable "aws_region" {}
variable "out_dir" {}
variable "tf_dir" {}

provider "aws" {
  region = var.aws_region
}
