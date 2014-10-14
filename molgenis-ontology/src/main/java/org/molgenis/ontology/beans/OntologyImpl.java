package org.molgenis.ontology.beans;

import org.apache.commons.lang3.StringUtils;
import org.molgenis.data.Entity;
import org.molgenis.data.semantic.Ontology;
import org.molgenis.ontology.repository.OntologyQueryRepository;

public class OntologyImpl implements Ontology
{
	private final Entity entity;

	public OntologyImpl(Entity entity)
	{
		this.entity = entity;
	}

	@Override
	public String getLabel()
	{
		return entity.getString(OntologyQueryRepository.ONTOLOGY_NAME);
	}

	@Override
	public String getDescription()
	{
		return entity.getString(OntologyQueryRepository.ONTOLOGY_TERM_DEFINITION);
	}

	@Override
	public String getIri()
	{
		return entity.getString(OntologyQueryRepository.ONTOLOGY_IRI);
	}

	@Override
	public String getVersion()
	{
		return StringUtils.EMPTY;
	}
}
