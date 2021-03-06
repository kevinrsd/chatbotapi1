const express = require("express");
const Student = require("../models").Student;
const StudentCourse = require("../models").StudentCourse;
const Classroom = require("../models").Classroom;
const Course = require("../models").Course;
const Grade = require("../models").Grade;
const Homework = require("../models").Homework;
const Meeting = require("../models").Meeting;


const router = express.Router();

router.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,token');
    next();
});

router.get( "/student",  async ( req, res ) => {
    const students = await Student.findAll()
    return res.json({
        ok: true,
        students,
        total_students: students.length
    })
});

router.post( "/student",  async ( req, res ) => {
    const { name,dni,lastname,phone,birthday, id_classroom } = req.body;
    try {
        if ( !name || !dni || !lastname || !id_classroom ) {
            return res.json({
                ok: false,
                error: "name, dni, id_classroom & lastname are required! phone & birthday optional"
            })
        }
        if ( typeof name != "string" || typeof dni != "string" ||  typeof lastname != "string" ){
            return res.json({
                ok: false,
                error: "name, dni & lastname must be string!"
            })
        }
        const find_student = await Student.findOne({
            where:{
                dni: dni
            }
        })
        if ( find_student ) {
            return res.json({
                ok: false,
                error: `Student with DNI: ${ dni } already exist!`,
            })
        }
        const find_classroom = await Classroom.findOne({
            where:{
                id: id_classroom
            }
        })
        if ( !find_classroom ) {
            return res.json({
                ok: false,
                error: `invalid id_classroom`,
            })
        }

        const new_student = await Student.create({ 
            name,dni,lastname,phone,birthday, idClassroom:id_classroom
          })
        return res.json({
            ok: true,
            message: "Student was created succesfully!",
            new_student
        })
    } catch (error) {
        console.log("ERROR", error)
        return res.json({
            ok: false,
            error: "Server Error: Error creating new Student!",
            error
        })
    }
});
router.get( "/student/:id",  async ( req, res ) => {

    const { id } = req.params;

    const student = await Student.findOne({
        where:{
            dni: id
        }
    })
    

    if ( student ) {

        const student_courses = await StudentCourse.findAll({
            where:{
                idStudent: student.id
            },
            include: [
                {
                    model: Course,
                    required: true,
                    include: [
                        {
                            model: Homework
                        }
                    ]
                },
                {
                    model: Grade,
                    required: true
                }
            ],
        })
        const student_meetings = await Meeting.findAll({
            idStudent: student.id
        })
        return res.json({
            ok: true,
            student,
            student_courses,
            student_meetings
        })
    }
    return res.json({
        ok: false,
        message: `Student with DNI: ${ id } don't found!`,
    })
});
router.delete( "/student/:id",  async ( req, res ) => {

    const { id } = req.params;
    const student = await Student.destroy({
        where:{
            dni: id
        }
    })
    if ( student ) {
        return res.json({
            ok: true,
            student,
            message: `Student with DNI ${ id } was deleted succesfully!`
        })
    }
    return res.json({
        ok: false,
        message: `Student with DNI: ${ id } don't found!`,
    })
});
module.exports = router;
