var React = require('react');
var Constants = require('../Constants');

var ValueBarComponent = require('./ValueBarComponent.jsx');

/**
 * Encapsulates the header of the table
 */
var OverviewCourseRowComponent = React.createClass({
    onClickCourse : function() {
        this.props.onClickCourse(this.props.data.course_whole_code);
    },

    onClickInstructor : function() {
        this.props.onClickInstructor(this.props.data.professor);
    },

    onClickMany : function() {
        this.props.onClickMany(this.props.data[this.props.collapseKey]);
    },

    /**
     * Render the header
     */
    render : function() {
        var data = this.props.data;
        var isCourseCodePresent = this.props.headers.indexOf('Course Code') != -1;
        var isInstructorPresent = this.props.headers.indexOf('Instructor') != -1;

        var courseCodeRow;
        if (isCourseCodePresent) {
            if (data.existing) {
                courseCodeRow = <td className='course-code' onClick={this.onClickCourse}>{data.course_whole_code}<span className={"course_time " + (isCourseCodePresent ? "" : "hidden")}>{' (' + data.time + ')'}</span></td>;
            } else {
                courseCodeRow = <td><span className={data.showing ? "glyphicon glyphicon-play rotated" : "glyphicon glyphicon-play"} onClick={this.onClickMany}></span><span className='course-code' onClick={this.onClickCourse}>{data.course_whole_code}</span></td>;
            }
        }

        var instructorRow;
        if (isInstructorPresent) {
            if (data.existing) {
                instructorRow = <td className='prof-name' onClick={this.onClickInstructor}>{data.professor}<span className={"course_time " + (isInstructorPresent && !isCourseCodePresent ? "" : "hidden")}>{' (' + data.time + ')'}</span></td>;
            } else {
                instructorRow = <td><span className={data.showing ? "glyphicon glyphicon-play rotated" : "glyphicon glyphicon-play"} onClick={this.onClickMany}></span><span className='prof-name' onClick={this.onClickInstructor}>{data.professor}</span></td>;
            }
        }

        if (isCourseCodePresent && isInstructorPresent) {
            if (!data.existing) {
                instructorRow = <td className='prof-name' onClick={this.onClickMany}>{data.professor}</td>;
            }
        }

        return (
            <tr className={(data.hidden ? "hidden" : "") + (data.colorThis ? " existing-expanded" : "")} >
                {courseCodeRow}
                {instructorRow}
                <td className="no-pad"><ValueBarComponent value={data.the_course_as_a_whole} max={5} /></td>
                <td className="no-pad"><ValueBarComponent value={data.the_course_content} max={5} /></td>
                <td className="no-pad"><ValueBarComponent value={data.amount_learned} max={5} /></td>
                <td className="no-pad"><ValueBarComponent value={data.instructors_effectiveness} max={5} /></td>
                <td className="no-pad"><ValueBarComponent value={data.grading_techniques} max={5} /></td>
                <td className="no-pad"><ValueBarComponent value={data.percent_enrolled} max={100} /></td>
            </tr>
        );
    }
});

module.exports = OverviewCourseRowComponent;
