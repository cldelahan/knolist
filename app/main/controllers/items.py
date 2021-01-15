import json

from flask import request, abort, jsonify
from sqlalchemy import String, BOOLEAN

from ..models.models import Project, Source, Item
from ..auth import requires_auth, AuthError


def get_authorized_item(user_id, item_id):
    item = Item.query.get(item_id)
    if item is None:
        abort(404)

    if item.project.user_id != user_id:
        raise AuthError({
            'code': 'invalid_user',
            'description': 'This item does not belong to the requesting user'
        }, 403)

    return item


def set_item_routes(app):
    """
    Reads the detailed information of a specific item.
    """

    @app.route('/items/<int:item_id>')
    @requires_auth('read:items-detail')
    def get_item_detail(user_id, item_id):
        item = get_authorized_item(user_id, item_id)

        return jsonify({
            'success': True,
            'item': item.format()
        })


    """
    Deletes an item
    """

    @app.route('/items/<int:item_id>', methods=['DELETE'])
    @requires_auth('delete:items')
    def delete_item(user_id, item_id):
        item = get_authorized_item(user_id, item_id)

        item.delete()

        return jsonify({
            'success': True,
            'deleted': item_id
        })

    """
    Updates the information in an item.
    The information to be updated is passed in a JSON body.
    """

    @app.route('/item/<int:item_id>', methods=['PATCH'])
    @requires_auth('update:items')
    def update_item(user_id, item_id):
        item = get_authorized_item(user_id, item_id)

        body = request.get_json()
        if body is None:
            abort(400)

        # Obtain the simple attributes
        is_note = body.get('is_note', None)
        is_highlight = body.get('is_highlight', None)
        content = body.get('content', None)
        x_position = body.get('x_position', None)
        y_position = body.get('y_position', None)
        # Obtain source id
        source_id = body.get('source_id', None)
        # Obtain project ID
        project_id = body.get('project_id', None)

        # Verify that at least one parameter was passed
        cond_1 = is_note is None and is_highlight is None
        cond_2 = content is None and x_position is None
        cond_3 = y_position is None and source_id is None and project_id is None
        if cond_1 and cond_2 and cond_3:
            abort(400)

        # Verify that parameters are correctly formatted
        if x_position is not None and type(x_position) is not int:
            abort(422)
        if y_position is not None and type(y_position) is not int:
            abort(422)
        if content is not None and type(content) is not String:
            abort(422)
        if is_note is not None and type(is_note) is not BOOLEAN:
            abort(422)
        if is_highlight is not None and type(is_highlight) is not BOOLEAN:
            abort(422)

        if project_id is not None:
            project = Project.query.get(project_id)
            if project is None:
                abort(422)
            if project.user_id != user_id:
                raise AuthError({
                    'code': 'invalid_user',
                    'description':
                        'This item does not belong to the requesting user.'
                }, 403)

        # Update values that are not None
        item.source_id = source_id if source_id is not None else item.source_id
        item.is_note = is_note if is_note is not None else item.is_note
        item.is_highlight = is_highlight if is_highlight is not None else item.is_highlight
        item.content = content if content is not None else item.content
        item.x_position = x_position if x_position is not None else item.x_position
        item.y_position = y_position if y_position is not None else item.y_position
        item.parent_project = project_id if project_id is not None else item.parent_project

        item.update()

        return jsonify({
            'success': True,
            'source': item.format()
        })
