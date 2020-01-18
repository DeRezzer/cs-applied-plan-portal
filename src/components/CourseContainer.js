import React from 'react'
import Course from './Course'
import FilterBar from './FilterBar'
import courses from './CourseList'
import filters from './FilterList'
import '../public/index.css'

export default class CourseContainer extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            initialCourses: [],
            courses: [],
            filter: ""
        }

        this.loadCourses = this.loadCourses.bind(this);
        this.filterSearch = this.filterSearch.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
    }

    loadCourses(){
        this.setState({
            initialCourses: courses,
            courses: courses
        });
    }

    filterSearch(event){
        let courses = this.state.initialCourses; 
        courses = courses.filter(c => {
            return (
                c.code.toLowerCase().includes(event.target.value.toLowerCase()) ||
                c.title.toLowerCase().includes(event.target.value.toLowerCase()) 
            );
        });
        this.setState({
            courses: courses
        });
    }

    handleFilterChange(value){
        this.setState({
            filter: value
        });
        let courses = this.state.initialCourses;
        courses = courses.filter(c => {
            return (
                c.code.startsWith(value)
            );
        });
        this.setState({
            courses: courses
        });
    }

    componentWillMount(){
        this.loadCourses()
    }

    render(){
        return(
        <div className="course-container">
            <div className="top-bar">
                <div className="search-container">
                    <form className="form-inline my-2 my-lg-0">
                        <input className="form-control mr-sm-2" type="text" placeholder="Search.." name="search" onChange={this.filterSearch}/>
                        <button className="btn btn-outline-success my-2 my-sm-0" type="submit"><i className="fa fa-search"></i></button>
                    </form>
                </div>
                <form className="course-filter form-group">
                    <FilterBar options={filters} value={this.state.filter} onValueChange={this.handleFilterChange}/>
                </form>
            </div>
            <div className="explore-courses">
                {this.state.courses.map(c => <Course key={c} code={c.code} title={c.title} credits={c.credits} 
                description={c.description} prereqs={c.prereqs} />) }
            </div>
        </div>
        );
    }
}