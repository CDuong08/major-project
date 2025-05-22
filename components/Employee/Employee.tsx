import './Employee.css';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const Employee = ({id, title }) => {

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({id})

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
        cursor: 'grab',
    }


    return (
        <div className="employee" ref={setNodeRef} {...attributes} {...listeners} style={style}>
            {title}
        </div>
    );
}