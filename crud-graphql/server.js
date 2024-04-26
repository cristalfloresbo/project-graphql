const express = require('express');
const { buildSchema } = require('graphql');

let courses = require('./courses.js');
const { graphqlHTTP } = require('express-graphql');

const app = express();

// schema definition language
const schema = buildSchema(
    `type Course {
        id: ID!,
        title: String!,
        views: Int
    }

    input CourseInput {
        title: String!,
        views: Int
    }

    type Alert {
        message: String
    }

    type Query {
        getCourses(page: Int, limit: Int = 1): [Course]
        getCourse(id: ID!): Course
    }
    type Mutation {
        addCourse(input: CourseInput): Course
        updateCourse(id: ID!, input: CourseInput): Course
        deleteCourse(id: ID!): Alert
    }
`); // template string

const root = {
    getCourses({ page, limit }) {
        if (page !== undefined) {
            return courses.slice((page - 1) * limit, page * limit);
        }
        return courses;
    },
    getCourse({ id }) {
        console.log(id);
        return courses.find((course) => id === course.id);
    },
    addCourse({ input }) {
        const id = String(courses.length + 1);
        const course = { id, ...input }; // { ... } => spread operator
        courses.push(course);
        return course;
    },
    updateCourse({ id, input }) {
        const courseIndex = courses.findIndex((course) => course.id === id);
        const course = courses[courseIndex];
        const newCourse = Object.assign(course, input);// si una propiedad no existe se agrega, si existe la propiedad se reemplaza
        course[courseIndex] = newCourse;
        return newCourse;
    },
    deleteCourse({ id }) {
        courses = courses.filter((course) => course.id !== id);
        return {
            message: `El courso con id ${id} fue eliminado.`
        }
    }
}

app.get('/', function (req, res) {
    res.json(courses);
});

//middleware
app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true
}))

app.listen(8080, function () {
    console.log("Servidor iniciado");
});