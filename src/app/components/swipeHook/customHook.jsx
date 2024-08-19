import { useSwipeable } from "react-swipeable";

function useSwipeHandlers(savedSchedules, setSwipedSchedule) {
    return savedSchedules.reduce((handlers, schedule) => {
        handlers[schedule.name] = useSwipeable({
            onSwipedRight: () => setSwipedSchedule(schedule.name),
            preventDefaultTouchmoveEvent: true,
            trackMouse: true
        });
        return handlers;
    }, {});
}

export default useSwipeHandlers;