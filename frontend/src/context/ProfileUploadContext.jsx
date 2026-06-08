import {createContext, useContext} from "react";

export const ProfileUploadContext = createContext(null);

export const useProfileUpload = () =>
    useContext(ProfileUploadContext);