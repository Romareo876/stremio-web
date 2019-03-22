const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const debounce = require('lodash.debounce');
const { Slider } = require('stremio-common');
const styles = require('./styles');

class SeekBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            time: null
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.time !== this.state.time ||
            nextProps.time !== this.props.time ||
            nextProps.duration !== this.props.duration ||
            nextProps.className !== this.props.className;
    }

    componentWillUnmount() {
        this.resetTimeDebounced.cancel();
    }

    resetTimeDebounced = debounce(() => {
        this.setState({ time: null });
    }, 1500)

    onSlide = (time) => {
        this.resetTimeDebounced.cancel();
        this.setState({ time });
    }

    onComplete = (time) => {
        this.resetTimeDebounced();
        this.setState({ time });
        this.props.dispatch('setProp', 'time', time);
    }

    onCancel = () => {
        this.resetTimeDebounced.cancel();
        this.setState({ time: null });
    }

    formatTime = (time) => {
        const hours = ('0' + Math.floor((time / (1000 * 60 * 60)) % 24)).slice(-2);
        const minutes = ('0' + Math.floor((time / (1000 * 60)) % 60)).slice(-2);
        const seconds = ('0' + Math.floor((time / 1000) % 60)).slice(-2);
        return `${hours}:${minutes}:${seconds}`;
    }

    renderTimeLabel() {
        if (this.props.time === null) {
            return null;
        }

        const time = this.state.time !== null ? this.state.time : this.props.time;
        return (
            <div className={styles['label']}>{this.formatTime(time)}</div>
        );
    }

    renderDurationLabel() {
        if (this.props.duration === null) {
            return null;
        }

        return (
            <div className={styles['label']}>{this.formatTime(this.props.duration)}</div>
        );
    }

    renderSlider() {
        if (this.props.time === null || this.props.duration === null) {
            return null;
        }

        const time = this.state.time !== null ? this.state.time : this.props.time;
        return (
            <Slider
                className={styles['slider']}
                value={time}
                minimumValue={0}
                maximumValue={this.props.duration}
                orientation={'horizontal'}
                onSlide={this.onSlide}
                onComplete={this.onComplete}
                onCancel={this.onCancel}
            />
        );
    }

    render() {
        if (this.props.time === null && this.props.duration === null) {
            return null;
        }

        return (
            <div className={classnames(styles['seek-bar-container'], { 'active': this.state.time !== null }, this.props.className)}>
                {this.renderTimeLabel()}
                {this.renderSlider()}
                {this.renderDurationLabel()}
            </div>
        );
    }
}

SeekBar.propTypes = {
    className: PropTypes.string,
    time: PropTypes.number,
    duration: PropTypes.number,
    dispatch: PropTypes.func.isRequired
};

module.exports = SeekBar;
