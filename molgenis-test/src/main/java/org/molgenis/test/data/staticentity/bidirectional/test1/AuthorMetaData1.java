package org.molgenis.test.data.staticentity.bidirectional.test1;

import org.molgenis.data.meta.SystemEntityMetaData;
import org.molgenis.data.meta.model.AttributeMetaData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Set;

import static java.util.Collections.singleton;
import static java.util.Objects.requireNonNull;
import static org.molgenis.MolgenisFieldTypes.AttributeType.ONE_TO_MANY;
import static org.molgenis.data.meta.model.EntityMetaData.AttributeRole.ROLE_ID;
import static org.molgenis.data.meta.model.EntityMetaData.AttributeRole.ROLE_LABEL;
import static org.molgenis.data.meta.model.Package.PACKAGE_SEPARATOR;
import static org.molgenis.data.system.model.RootSystemPackage.PACKAGE_SYSTEM;

/**
 * AuthorMetaData1 and BookMetaData1 define two entities with a OneToMany relation of which no side is required.
 */
@Component
public class AuthorMetaData1 extends SystemEntityMetaData
{
	private static final String SIMPLE_NAME = "Author1";
	public static final String MY_ENTITY = PACKAGE_SYSTEM + PACKAGE_SEPARATOR + SIMPLE_NAME;

	public static final String ID = "id";
	public static final String LABEL = "label";
	public static final String ATTR_BOOKS = "books";

	private BookMetaData1 bookMetaData;

	AuthorMetaData1()
	{
		super(SIMPLE_NAME, PACKAGE_SYSTEM);
	}

	@Override
	public void init()
	{
		setLabel("Author");

		addAttribute(ID, ROLE_ID).setLabel("Identifier");
		addAttribute(LABEL, ROLE_LABEL).setNillable(true).setLabel("Label");
		AttributeMetaData attribute = bookMetaData.getAttribute(BookMetaData1.AUTHOR);
		addAttribute(ATTR_BOOKS).setDataType(ONE_TO_MANY).setRefEntity(bookMetaData).setMappedBy(attribute);
	}

	@Autowired
	public void setBookMetaData(BookMetaData1 bookMetaData)
	{
		this.bookMetaData = requireNonNull(bookMetaData);
	}

	@Override
	public Set<SystemEntityMetaData> getDependencies()
	{
		return singleton(bookMetaData);
	}
}
