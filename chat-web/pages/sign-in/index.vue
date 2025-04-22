
<script lang="ts" setup>
import * as yup from 'yup';
import { Form,Field,ErrorMessage,useForm } from 'vee-validate';
import toastStore from '~/store/toast-store';
import authStore from '~/store/auth-store';

const toast = toastStore()
const auth = authStore()
useHead({
    title : "Sign-in Chat"
})

const schema = yup.object({
  email: yup.string().required("Email required").email("This email does not an validated email address"),
  password : yup.string().required("Password required.")
});


const onSubmit = async (values : any) => {
    const result = await auth.signIn(values)
    if(result.status == 200){
        window.location.reload()
    }
    toast.sendToastWithResponse(result)
}

</script>

<template>
    <div class="container vh-100 d-flex align-items-center justify-content-center">
        <Form class="w-25 m-0 p-0" @submit="onSubmit" :validation-schema="schema" >
                <div class="mb-3">
                    <h2>Sign in</h2>
                </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <Field name="email" class="form-control" id="email" type="email" />
                <ErrorMessage name="email" as="div" class="text-danger text-capitalize mt-1" />
            </div>

            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <Field name="password" class="form-control" id="password" type="password" />
                <ErrorMessage name="password" as="div" class="text-danger text-capitalize mt-1" />
            </div>

            <input type="submit" class="btn btn-primary w-100" value="Sign in">
            <span class="d-flex">
                <p>Don't have a account?</p>
                <NuxtLink to="/sign-up" class="px-2">Sign up</NuxtLink>
            </span>
        </Form>
    </div>
</template>
