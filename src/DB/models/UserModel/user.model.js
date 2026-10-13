// ---------------------------------------------------------------------
// Schema = a list of rules. It says: "every user must look like this."
// model  = a tool. We use it to save, find, and change users in the database.
// ---------------------------------------------------------------------
import { model, Schema } from "mongoose";

// Enum = a list of allowed choices. For example: gender can only be male or female.
// We keep these lists in another file (user.types.js).
import { GenderEnum, providerEnum, roleEnum } from "../../../modules/UserModule/user.types.js";



const userSchema = new Schema({

    // ================================================================
    //                        BASIC INFORMATION
    // ================================================================

    FirstName: {
        type: String,       // String = text. Example: "Ahmed"
        required: true      // required = you MUST give this value. If it is empty -> error.
    },
    LastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true        // unique = no two users can have the same email.
        // Like an ID card: every person has a different one.
    },
    phone: {
        type: String,       // We use text, not a number.
        // A number cuts the first zero: 0123 becomes 123. Text keeps it.
        required: true
    },
    password: {
        type: String,       // We never save the real password.
        // We save a secret version of it (this is called a "hash").
        // So even if someone steals the database, they can't read it.
        required: true
    },
    age: Number,            // Just a number. No extra rules.
    profileImage: {
        type: String        // We save the picture's link, like "images/ali.png".
        // We do not save the picture itself in the database.
    },
    bio: String,            // A short text about the user.
    userName: {
        type: String,
        required: true,
        unique: true        // Two users can't have the same username.
    },


    // ================================================================
    //                             GENDER
    // ================================================================
    // enum = a list of allowed choices. Think of a multiple-choice question:
    // you must pick one answer from the list. No other answer is allowed.
    //
    // Our GenderEnum is:  male = 0,  female = 1
    // Object.values(GenderEnum) gives us the list [0, 1].
    //
    // So gender can be only 0 or 1.
    // If someone sends 5, it is not in the list -> MongoDB says "error".
    //
    // Why numbers and not words? Numbers are short and easy to save.
    gender: {
        type: Number,
        enum: Object.values(GenderEnum)
    },


    // ================================================================
    //                            PROVIDER
    // ================================================================
    // Provider = the way the user joined our app.
    // Think of a building with different doors. The user can enter from one door:
    //
    //   0 = system   -> the user signed up in OUR app with email + password
    //   1 = google   -> the user pressed "Sign in with Google"
    //   2 = facebook -> the user pressed "Sign in with Facebook"
    //   4 = apple    -> the user pressed "Sign in with Apple"
    //
    // Why is it important?
    //   1) A Google user has NO password in our app. Google checks them, not us.
    //      So we must know the provider, to know if we need a password or not.
    //   2) It tells us which door to use when the user logs in again.
    //   3) It stops mistakes. Example: a Google user can't log in with a password.
    //
    // default = the value we use when nobody sends one.
    // Here we think: "if nothing is sent, the user used email + password (system)."
    provider: {
        type: Number,
        enum: Object.values(providerEnum),
        default: providerEnum.system
    },


    // ================================================================
    //                              ROLE
    // ================================================================
    // Role = what the user is allowed to do.
    //   0 = user  -> a normal person
    //   1 = admin -> the boss, can do more things
    //
    // default is "user". So every new account starts as a normal person.
    // Nobody becomes an admin by mistake.
    role: {
        type: Number,
        enum: Object.values(roleEnum),
        default: roleEnum.user
    },


    // ================================================================
    //                          CONFIRMED AT
    // ================================================================
    // The date and time when the user said "yes, this email is mine."
    // Usually the user clicks a link that we send to their email.
    //
    //   Empty         -> the user did NOT confirm yet.
    //   Has a date    -> the user confirmed. Example: 2026-10-11 at 2:30 PM
    confirmedAt: {
        type: Date
    },


    // ================================================================
    //                           BLOCKED AT
    // ================================================================
    // The date and time when we blocked the user (for example, for bad behavior).
    //
    //   Empty         -> the user is free. Not blocked.
    //   Has a date    -> the user is blocked since that date.
    //
    // Why a date and not just true / false?
    // Because a date tells us two things: "is blocked?" and "WHEN did it happen?"
    blockedAt: {
        type: Date
    }

}, {
    // ================================================================
    //                        SCHEMA OPTIONS
    //   These are settings for the WHOLE schema, not for one field.
    // ================================================================


    // ---------------------------- TIMESTAMPS ----------------------------
    // MongoDB writes the time for us. We don't write any code. It adds 2 fields:
    //   createdAt -> the time the user joined
    //   updatedAt -> the last time something changed in this user
    timestamps: true,


    // ------------------------------ STRICT ------------------------------
    // Strict = "only save the fields that are in my list."
    // Any other field is thrown away.
    //
    // Example: a bad person sends   { userName: "ali", isAdmin: true }
    // "isAdmin" is not in our list, so MongoDB deletes it. We are safe!
    strict: true,


    // --------------------------- STRICT QUERY ---------------------------
    // Same idea as strict, but for SEARCHING (find, findOne, ...).
    // If we search with a field that is not in our list, MongoDB ignores that field.
    //
    // Example: find({ hello: 1 })
    // "hello" is not in our list, so MongoDB searches without it.
    strictQuery: true,


    // ------------------------ OPTIMISTIC CONCURRENCY --------------------
    // The problem: two people change the same user at the same time.
    // Without protection, the second save deletes the first person's change.
    //
    // The solution: every user has a hidden version number called __v.
    //
    //   1) The user starts at version 0.
    //   2) Ahmed opens the user (version 0). Sara opens the same user (version 0).
    //   3) Ahmed saves first. The version becomes 1.
    //   4) Sara tries to save, but she still has version 0.
    //      MongoDB says: "Error! Someone changed this before you."
    //   5) Sara must open the user again and see Ahmed's change.
    //
    // Why is it called "optimistic"?
    // Optimistic means "I hope everything is fine."
    // MongoDB does not stop people from opening the user.
    // It only checks the version at the end, when someone saves.
    optimisticConcurrency: true,


    // ----------------------------- TO JSON ------------------------------
    // JSON = the text format that we send to the client (phone, website, Postman).
    // When we write res.json(user), MongoDB uses these settings.
    // ================================================================
    //                             toJSON
    // ================================================================
    // Used when: we write res.json(user).
    // The user goes OUT to the client (browser or phone) as JSON text.
    // Goal: we decide what the client can see.
    toJSON: {
        // Does: shows fake fields (made by code, not saved in DB), like fullName.
        // Need: MongoDB hides them by default.
        virtuals: true,

        // Does: runs getters (small functions that run when a value is read).
        // Need: so the answer has the right values.
        getters: true,

        // transform = changes a COPY of the user right before we send it.
        //   doc = the real user.   ret = the copy that will be sent.
        // "delete" removes a field from the COPY only:
        //   - MongoDB database -> not changed (the field is still saved)
        //   - Our server code  -> not changed (we can still use the field)
        //   - The client       -> does NOT see the field
        transform(doc, ret) {
            delete ret.id         // Does: removes "id".        Need: it is the same as "_id".
            delete ret.password   // Does: removes password.    Need: the client must never see it.
            return ret            // Does: gives back the copy. Need: if not, the answer is empty.
        }
    },


    // ================================================================
    //                            toObject
    // ================================================================
    // Used when: we write user.toObject().
    // The user becomes a normal JavaScript object and stays INSIDE our server.
    // Goal: make the user easy to use in our own code.
    toObject: {
        virtuals: true,         // Same as toJSON: show fake fields like fullName.
        getters: true,          // Same as toJSON: run getters.

        transform(doc, ret) {
            delete ret.id       // Does: removes "id".  Need: it is the same as "_id".

            // We do NOT delete the password here.
            // Need: inside the server we may need it, for example to check it at login.
            // Nobody outside can see it, because this object never goes to the client.
            return ret
        }
    },


    // ================================================================
    //                    THE DIFFERENCE IN ONE LOOK
    // ================================================================
    //             | toJSON (goes to the client) | toObject (stays in the server)
    //   id        | removed                     | removed
    //   password  | removed                     | kept
    //   _id       | kept (client needs it to find the user later) | kept


    // ============================ VIRTUALS ==============================
    // A virtual is a FAKE field.
    //   - You can use it like a real field: user.fullName
    //   - But it is NOT saved in the database.
    //   - MongoDB makes it when you ask for it.
    //
    // Why do we need it?
    // We already save the name in FirstName and LastName.
    // We don't want to save the same name again. So we make fullName from them.
    virtuals: {
        fullName: {

            // ------------------------- GETTER --------------------------
            // Getter = runs when you READ the field.
            // It is like asking a question: "What is the full name?"
            //
            // Example: FirstName = "Ahmed", LastName = "Ali"
            //   console.log(user.fullName)   ->   "Ahmed Ali"
            //
            // "this" means the current user.
            get() {
                return this.FirstName + " " + this.LastName
            },

            // ------------------------- SETTER --------------------------
            // Setter = runs when you WRITE (give a value to) the field.
            // It is like giving an order: "Set the full name to Ahmed Ali."
            //
            //   user.fullName = "Ahmed Ali"
            //
            // The setter breaks the name into two pieces and saves each piece
            // in its real field. It has 3 steps:
            set(value) {
                // STEP 1: cut the text at the space.
                //   "Ahmed Ali".split(" ")  ->  ["Ahmed", "Ali"]
                // The first piece goes into FirstName. The second piece goes into LastName.
                const [FirstName, LastName] = value.split(" ")

                // STEP 2: check that we have both pieces.
                // Example: if the user writes only "Ahmed", there is no LastName -> error.
                if (!FirstName || !LastName) {
                    throw new Error("in-valid-fullname");
                }

                // STEP 3: save each piece in its real field.
                // this.set("field name", value)
                //   - "FirstName" in quotes = the NAME of the field (it is text).
                //   - FirstName without quotes = the VALUE, like "Ahmed".
                this.set("FirstName", FirstName)
                this.set("LastName", LastName)
            }

        }
    }


})


// "User" is the name of the model.
// MongoDB makes a collection called "users" (small letters, and plural).
// We export it, so we can use it in the service:
//   userModel.create(...)   -> make a new user
//   userModel.findOne(...)  -> find one user
export const userModel = model("User", userSchema)