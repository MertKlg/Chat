<template>
  <div class="container vh-100 d-flex align-items-center justify-content-center">
    <Form class="w-25 m-0 p-0" @submit="onSubmit" :validation-schema="schema">
      <div class="mb-3">
        <h2>Sign up</h2>
      </div>

      <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <Field name="username" class="form-control" id="username" type="text" />
        <ErrorMessage name="username" as="div" class="text-danger text-capitalize mt-1" />
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Email address</label>
        <Field name="email" class="form-control" id="email" type="email" />
        <ErrorMessage name="email" as="div" class="text-danger text-capitalize mt-1" />
      </div>

      <div class="mb-3">
        <label for="phone" class="form-label">Phone number</label>
        <Field name="phone" class="form-control" id="phone" type="tel" />
        <ErrorMessage name="phone" as="div" class="text-danger text-capitalize mt-1" />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <Field name="password" class="form-control" id="password" type="password" />
        <ErrorMessage name="password" as="div" class="text-danger text-capitalize mt-1" />
      </div>

      <div class="mb-3">
        <label for="passwordAgain" class="form-label">Password Again</label>
        <Field name="passwordAgain" class="form-control" id="passwordAgain" type="password" />
        <ErrorMessage name="passwordAgain" as="div" class="text-danger text-capitalize mt-1" />
      </div>

      <input type="submit" class="btn btn-primary w-100" value="Sign in" />
      <span class="d-flex">
        <p>You have already a account ?</p>
        <NuxtLink to="/sign-in" class="px-2">Sign in</NuxtLink>
      </span>
    </Form>
  </div>
</template>

<script lang="ts" setup>
import * as yup from "yup";
import { Form, Field, ErrorMessage, useForm } from 'vee-validate';
import { API_URL } from "~/common/API";
import toastStore from "~/store/toast-store";
import type IResponse from "~/model/response";
const toast = toastStore()

const rePhoneNumber = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/;


const schema = yup.object({
  username: yup.string().required("Username required"),
  email: yup
    .string()
    .required("Email required")
    .email("This email does not an validated email address"),

  phone: yup.string()
    .matches(rePhoneNumber, "Phone number not validated")
    .required("Phone number required"),

  password: yup
    .string()
    .required("Password required."),

  passwordAgain: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Password-again is required'),
});

const onSubmit = async (values: any) => {
  const { data, error } = await useFetch(`${API_URL}/auth/sign-up`, { body: values, method: "POST", credentials: "include" })
  if (error.value != null) {
    const res = error.value.data as IResponse
    toast.error({ title: res.message, description: "" })
    return
  }
  const res = data.value as IResponse
  toast.success({ title: res.message, description: "" })
};
</script>