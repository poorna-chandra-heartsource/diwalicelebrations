export interface IUser {
    full_name?: string,
    email?: string,
    password?: string,
    resetToken?:string,
    resetTokenExpires?:Date,
    mobile?: string,
    created_dt?: string,
    modified_dt?: string,
    deleted_dt?: string
}