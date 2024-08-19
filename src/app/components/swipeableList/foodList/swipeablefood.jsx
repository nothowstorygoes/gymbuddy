import React from 'react';
import { SwipeableList, SwipeableListItem, SwipeAction, TrailingActions } from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import styles from './foodList.module.css';
const SwipeableListComponentFood = ({ 
    items = [], 
    renderItem, 
    keyExtractor, 
    getTrailingActions 
}) => {
    return (
        <SwipeableList className={styles.list}>
            {items.map((item) => (
                <SwipeableListItem
                    key={keyExtractor(item)}
                    trailingActions={getTrailingActions(item)}
                    className={styles.swipeableListItem}
                >
                    {renderItem(item)}
                </SwipeableListItem>
            ))}
        </SwipeableList>
    );
};

export default SwipeableListComponentFood;