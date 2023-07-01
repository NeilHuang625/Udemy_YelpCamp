const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js")
const {cloudinary} = require("../cloudinary")

const CampgroundSchema = new Schema({
    images:[
        {
            url:String,
            filename:String
        }
    ],
    title: String,
    location: String,
    price: Number,
    description: String,
    geometry:{
        type:{
            type:String,
            enum:["Point"],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    reviews:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }]
});

CampgroundSchema.post("findOneAndDelete", async (doc)=>{
    if(doc.reviews.length){
        await Review.deleteMany({_id: {$in : doc.reviews} })
    }
    //delete cloudinary pics associated with this campground
    for(let img of doc.images ){
        cloudinary.uploader.destroy(img.filename);
    }
})

CampgroundSchema.path('images').schema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload/', '/upload/w_300/');
});

module.exports = mongoose.model("Campground" , CampgroundSchema);
