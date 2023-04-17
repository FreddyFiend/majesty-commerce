import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { useForm, SubmitHandler, FormProvider, set } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormInput from "../components/FormInput";
import { useMutation } from "@tanstack/react-query";
import { api, apiAuth, loginUserFn } from "../routes/usersApi";
import { UserContext } from "../providers/UserProvider";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "*Email address is required!")
    .email("*Email Address is invalid!"),
  password: z.string().min(1, "Password is required"),
});

// extract the inferred type
export type LoginInput = z.TypeOf<typeof LoginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const getProfile = () => {
    apiAuth.get("auth/profile", { withCredentials: true }).then((res) => {
      console.log(res.data);
      setUser(res.data);

      console.log("Get Profile Clicked");
    });
  };
  const { mutate: loginUser } = useMutation(
    (userData: LoginInput) => loginUserFn(userData),
    {
      onMutate() {
        // store.setRequestLoading(true);
      },
      onSuccess: (res) => {
        toast.success(`Logged in as ${res.data.user.email}`);
        navigate("/");
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        /*  store.setRequestLoading(false);
   
        navigate(from); */
      },
      onError: (error: any) => {
        console.log(error);
        console.log("faa");
        //store.setRequestLoading(false);
        if (Array.isArray((error as any).response.data.error)) {
          (error as any).response.data.error.forEach((el: any) =>
            toast.error(el.message, {
              position: "top-right",
            })
          );
          console.log(error);
        } else {
          console.log(error);
          toast.error((error as any).response.data.message, {
            position: "top-right",
          });
        }
      },
    }
  );

  const methods = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    shouldUseNativeValidation: true,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;
  const logoutUser = () => {
    localStorage.removeItem("user");
    setUser(null);
  };
  const signinUser = (values: LoginInput) => {
    api
      .post("auth/local/login", values)
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => console.log("king"));
  };

  const onSubmitHandler: SubmitHandler<LoginInput> = (values) => {
    loginUser(values);
    //signinUser(values);
  };

  return (
    <div>
      <FormProvider {...methods}>
        <form
          className="flex flex-col justify-center items-center"
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <FormInput label="Email" name="email" type="email" />
          <FormInput label="Password" name="password" type="password" />

          <input type="submit" className="p-btn mt-3" />
        </form>
      </FormProvider>

      <h1 className="pt-2 text-lg text-center">
        Not registered yet?{" "}
        <Link className="font-bold text-blue-600" to="/signup">
          Signup!
        </Link>{" "}
      </h1>
      <button onClick={logoutUser}>logout user</button>

      <button className="p-btn" onClick={getProfile}>
        Get User Info
      </button>
    </div>
  );
};

export default Login;
